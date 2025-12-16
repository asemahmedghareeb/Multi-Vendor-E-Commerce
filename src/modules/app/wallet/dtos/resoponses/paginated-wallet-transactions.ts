import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';


@ObjectType()
export class PaginatedWalletTransactions extends paginatedObjectTypeFactory(WalletTransaction) {}
