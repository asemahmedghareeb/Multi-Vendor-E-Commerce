import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionType,
} from './entities/wallet-transaction.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/common/enums/roles.enum';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { PayoutInput } from './entities/payout.input';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  @Transactional()
  async processOrderRevenue(order: Order) {
    const superAdmin = await this.userRepo.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      relations: ['wallet'],
    });

    if (!superAdmin) {
      console.warn('No Super Admin found to receive commissions!');
    }

    for (const item of order.items) {
      const vendorUser = await this.userRepo.findOne({
        where: { vendorProfile: { id: item.vendorId } },
        relations: ['wallet', 'vendorProfile'],
      });

      if (!vendorUser || !vendorUser.vendorProfile) continue;

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
    const superAdmin = await this.userRepo.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      relations: ['wallet'],
    });

    for (const { orderItem, quantity } of itemsToRefund) {
      const remainingQty = orderItem.quantity - orderItem.refundedQuantity;

      if (quantity > remainingQty) {
        console.warn(
          `Skipping Item ${orderItem.id}: Requested ${quantity} but only ${remainingQty} remaining.`,
        );
        continue;
      }

      const vendorUser = await this.userRepo.findOne({
        where: { vendorProfile: { id: orderItem.vendorId } },
        relations: ['wallet', 'vendorProfile'],
      });

      if (!vendorUser?.wallet || !vendorUser?.vendorProfile) continue;

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

  @Transactional()
  async executePayout(input: PayoutInput): Promise<WalletTransaction> {
    const vendor = await this.vendorRepo.findOne({
      where: { id: input.vendorId },
      relations: ['user', 'user.wallet'],
    });

    if (!vendor || !vendor.user?.wallet) {
      throw new NotFoundException('events.vendor.NOT_FOUND');
    }

    const wallet = vendor.user.wallet;
    const payoutAmountCents = input.amount * 100;

    if (wallet.balance < payoutAmountCents) {
      throw new BadRequestException({
        key: 'events.wallet.INSUFFICIENT_FUNDS',
        args: { currentBalance: wallet.balance / 100 },
      });
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
