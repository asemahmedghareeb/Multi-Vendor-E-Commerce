import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';

export class WalletTransactionService {
  constructor(
    @InjectAppRepository(WalletTransaction)
    private readonly walletTransactionRepository: AppRepository<WalletTransaction>,
    @InjectAppRepository(Wallet)
    private readonly walletRepository: AppRepository<Wallet>,
  ) {}

  async walletTransactions(user: User, input: PaginatorInput){
    const { page, limit } = input;
    const wallet = await this.walletRepository.findOneOrFail({
      where: { user },
    });
    
    return await this.walletTransactionRepository.findPaginated(
      { wallet: { id: wallet.id } },
      { createdAt: 'DESC' },
      page,
      limit,
    );
  }
}
