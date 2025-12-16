import { Injectable } from '@nestjs/common';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { Order } from '../../orders/entities/order.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Transactional } from 'typeorm-transactional';
import { PayoutInput } from '../dtos/inputs/payout.input';
import { TransactionType } from '../enums/transactions.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectAppRepository(Wallet)
    private readonly walletRepo: AppRepository<Wallet>,
    @InjectAppRepository(WalletTransaction)
    private readonly txRepo: AppRepository<WalletTransaction>,
    @InjectAppRepository(User)
    private readonly userRepo: AppRepository<User>,
    @InjectAppRepository(OrderItem)
    private readonly orderItemRepo: AppRepository<OrderItem>,
    @InjectAppRepository(Vendor)
    private readonly vendorRepo: AppRepository<Vendor>,
  ) {}

  @Transactional()
  async processOrderRevenue(order: Order) {
    const superAdmin = await this.userRepo.findOneOrFail({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
      relations: ['wallet'],
    });

    for (const item of order.items) {
      const vendorUser = await this.userRepo.findOne({
        where: { vendorProfile: { id: item.vendorId } },
        relations: ['wallet', 'vendorProfile'],
      });

      if (!vendorUser || !vendorUser.vendorProfile) {
        throw new AppHttpException(
          ErrorCodeEnum.VENDOR_NOT_FOUND,
        );
      }

      let vendorWallet = vendorUser.wallet;
      if (!vendorWallet) {
        vendorWallet = this.walletRepo.create({ user: vendorUser, balance: 0 });
        await this.walletRepo.save(vendorWallet);
      }

      const itemTotal = item.priceAtPurchase * item.quantity;
      const commissionRate =
        Number(vendorUser.vendorProfile.commissionRate) / 100;

      const commissionFee = Math.floor(itemTotal * commissionRate);
      const vendorIncome = itemTotal - commissionFee;

      vendorWallet.balance += vendorIncome;
      await this.walletRepo.save(vendorWallet);

      const vendorTx = this.txRepo.create({
        wallet: vendorWallet,
        order: order,
        amount: vendorIncome,
        type: TransactionType.SALE,
        description: `Revenue from ${item.quantity}x Item #${item.productId}`,
      });
      await this.txRepo.save(vendorTx);

      if (superAdmin) {
        let adminWallet = superAdmin.wallet;
        if (!adminWallet) {
          adminWallet = this.walletRepo.create({
            user: superAdmin,
            balance: 0,
          });
          await this.walletRepo.save(adminWallet);
          superAdmin.wallet = adminWallet;
        }

        adminWallet.balance += commissionFee;
        await this.walletRepo.save(adminWallet);

        const adminTx = this.txRepo.create({
          wallet: adminWallet,
          order: order,
          amount: commissionFee,
          type: TransactionType.COMMISSION,
          description: `Commission from Order #${order.id} (Vendor: ${vendorUser.vendorProfile.businessName})`,
        });
        await this.txRepo.save(adminTx);
      }

      await this.vendorRepo.increment(
        { id: item.vendorId },
        'totalSales',
        item.quantity,
      );
    }
  }

  async getMyWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user) {
        wallet = this.walletRepo.create({ user, balance: 0 });
        await this.walletRepo.save(wallet);
      }
    }

    return wallet!;
  }

  @Transactional()
  async refundSpecificItems(
    order: Order,
    itemsToRefund: { orderItem: OrderItem; quantity: number }[],
  ) {
    const superAdmin = await this.userRepo.findOneOrFail({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
      relations: ['wallet'],
    });

    for (const { orderItem, quantity } of itemsToRefund) {
      const remainingQty = orderItem.quantity - orderItem.refundedQuantity;

      if (quantity > remainingQty) {
        throw new AppHttpException(
          ErrorCodeEnum.BAD_REQUEST_EXCEPTION,
        );
      }

      const vendorUser = await this.userRepo.findOne({
        where: { vendorProfile: { id: orderItem.vendorId } },
        relations: ['wallet', 'vendorProfile'],
      });

      if (!vendorUser || !vendorUser.vendorProfile || !vendorUser.wallet) {
        throw new AppHttpException(
          ErrorCodeEnum.VENDOR_NOT_FOUND,
        );
      }

      const itemRefundAmount = orderItem.priceAtPurchase * quantity;

      const rate = Number(vendorUser.vendorProfile.commissionRate) / 100;
      const adminShare = Math.floor(itemRefundAmount * rate);
      const vendorShare = itemRefundAmount - adminShare;

      vendorUser.wallet.balance -= vendorShare;
      await this.walletRepo.save(vendorUser.wallet);

      const vendorTx = this.txRepo.create({
        wallet: vendorUser.wallet,
        order: order,
        amount: -vendorShare,
        type: TransactionType.REFUND,
        description: `Refund: ${quantity}x ${orderItem.product.name}`,
      });
      await this.txRepo.save(vendorTx);

      if (superAdmin?.wallet) {
        superAdmin.wallet.balance -= adminShare;
        await this.walletRepo.save(superAdmin.wallet);

        const adminTx = this.txRepo.create({
          wallet: superAdmin.wallet,
          order: order,
          amount: -adminShare,
          type: TransactionType.REFUND,
          description: `Commission Refund: ${quantity}x ${orderItem.product.name}`,
        });
        await this.txRepo.save(adminTx);
      }

      orderItem.refundedQuantity += quantity;
      await this.orderItemRepo.save(orderItem);
    }
  }

  async executePayout(input: PayoutInput): Promise<WalletTransaction> {
    const vendor = await this.vendorRepo.findOne({
      where: { id: input.vendorId },
      relations: ['user', 'user.wallet'],
    });

    if (!vendor || !vendor.user?.wallet) {
      throw new AppHttpException(ErrorCodeEnum.VENDOR_NOT_FOUND);
    }

    const wallet = vendor.user.wallet;
    const payoutAmountCents = input.amount * 100;

    if (wallet.balance < payoutAmountCents) {
      throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION); 
    }
    wallet.balance -= payoutAmountCents;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      wallet: wallet,
      amount: -payoutAmountCents,
      type: TransactionType.PAYOUT,
      description: `Payout of $${input.amount} to Vendor ${vendor.businessName}`,
    });

    const savedTx = await this.txRepo.save(tx);

    return savedTx;
  }
}