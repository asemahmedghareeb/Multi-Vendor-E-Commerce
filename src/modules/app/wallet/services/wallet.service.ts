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

  private async findOrCreateWalletForUser(user: User): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (wallet) {
      return wallet;
    }
    try {
      const newWallet = this.walletRepo.create({ user, balance: 0 });
      await this.walletRepo.save(newWallet);
      return newWallet;
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        return this.walletRepo.findOneOrFail({
          where: { user: { id: user.id } },
        });
      }
      throw error;
    }
  }

  @Transactional()
  async processOrderRevenue(order: Order) {
    const superAdmin = await this.userRepo.findOneOrFail({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
    });

    for (const item of order.items) {
      console.log('item', item);
      const vendor = await this.vendorRepo.findOneOrFail({
        where: { id: item.vendorId },
        relations: ['user'],
      });

      const vendorUser = vendor.user;

      if (!vendorUser) {
        throw new AppHttpException(ErrorCodeEnum.VENDOR_NOT_FOUND);
      }

      const vendorWallet = await this.findOrCreateWalletForUser(vendorUser);

      const itemTotal = item.priceAtPurchase * item.quantity;
      const commissionRate = Number(vendor.commissionRate) / 100;

      const commissionFee = Math.floor(itemTotal * commissionRate);
      const vendorIncome = itemTotal - commissionFee;

      vendorWallet.balance += vendorIncome;
      await this.walletRepo.save(vendorWallet);
      console.log('vendorWallet', vendorWallet);

      const vendorTx = this.txRepo.create({
        wallet: vendorWallet,
        order: order,
        amount: vendorIncome,
        type: TransactionType.SALE,
        description: `Revenue from ${item.quantity}x Item #${item.productId}`,
      });
      await this.txRepo.save(vendorTx);

      if (superAdmin) {
        const adminWallet = await this.findOrCreateWalletForUser(superAdmin);

        adminWallet.balance += commissionFee;
        await this.walletRepo.save(adminWallet);

        const adminTx = this.txRepo.create({
          wallet: adminWallet,
          order: order,
          amount: commissionFee,
          type: TransactionType.COMMISSION,
          description: `Commission from Order #${order.id} (Vendor: ${vendor.businessName})`,
        });
        await this.txRepo.save(adminTx);
        console.log('adminWallet', adminWallet);
      }

      await this.vendorRepo.increment(
        { id: item.vendorId },
        'totalSales',
        item.quantity,
      );
    }
  }

  async getMyWallet(userId: string): Promise<Wallet> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    return this.findOrCreateWalletForUser(user);
  }

  @Transactional()
  async refundSpecificItems(
    order: Order,
    itemsToRefund: { orderItem: OrderItem; quantity: number }[],
  ) {
    const superAdmin = await this.userRepo.findOneOrFail({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
    });

    for (const { orderItem, quantity } of itemsToRefund) {
      const remainingQty = orderItem.quantity - orderItem.refundedQuantity;

      if (quantity > remainingQty) {
        throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION);
      }

      const vendor = await this.vendorRepo.findOneOrFail({
        where: { id: orderItem.vendorId },
        relations: ['user'],
      });

      const vendorUser = vendor.user;

      if (!vendorUser) {
        throw new AppHttpException(ErrorCodeEnum.VENDOR_NOT_FOUND);
      }

      const vendorWallet = await this.findOrCreateWalletForUser(vendorUser);

      const itemRefundAmount = orderItem.priceAtPurchase * quantity;

      const rate = Number(vendor.commissionRate) / 100;
      const adminShare = Math.floor(itemRefundAmount * rate);
      const vendorShare = itemRefundAmount - adminShare;

      vendorWallet.balance -= vendorShare;
      await this.walletRepo.save(vendorWallet);

      const vendorTx = this.txRepo.create({
        wallet: vendorWallet,
        order: order,
        amount: -vendorShare,
        type: TransactionType.REFUND,
        description: `Refund: ${quantity}x ${orderItem.product.name}`,
      });
      await this.txRepo.save(vendorTx);

      if (superAdmin) {
        const adminWallet = await this.findOrCreateWalletForUser(superAdmin);
        adminWallet.balance -= adminShare;
        await this.walletRepo.save(adminWallet);

        const adminTx = this.txRepo.create({
          wallet: adminWallet,
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
    const vendor = await this.vendorRepo.findOneOrFail(
      {
        where: { id: input.vendorId },
        relations: ['user', 'user.wallet'],
      },
      ErrorCodeEnum.VENDOR_NOT_FOUND,
    );

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
