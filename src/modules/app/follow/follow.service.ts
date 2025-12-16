import { Injectable } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { FindOptionsRelations } from 'typeorm';

@Injectable()
export class FollowsService {
  constructor(
    @InjectAppRepository(Follow) private followRepo: AppRepository<Follow>,
    @InjectAppRepository(User) private userRepo: AppRepository<User>,
    @InjectAppRepository(Vendor) private vendorRepo: AppRepository<Vendor>,
  ) {}

  async follow(userId: string, vendorId: string): Promise<boolean> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { id: vendorId },
    });

    if (user.id === vendor.userId) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }
    const existing = await this.followRepo.findOne({
      where: {
        follower: { id: userId },
        vendor: { id: vendorId },
      },
    });

    if (existing) return true;

    const follow = this.followRepo.create({
      follower: { id: userId },
      vendor: { id: vendorId },
    });

    await this.followRepo.save(follow);
    await this.userRepo.increment({ id: userId }, 'followingCount', 1);
    await this.vendorRepo.increment({ id: vendorId }, 'followersCount', 1);

    return true;
  }
  async unfollow(userId: string, vendorId: string): Promise<boolean> {
    const result = await this.followRepo.delete({
      follower: { id: userId },
      vendor: { id: vendorId },
    });

    if (result.affected && result.affected > 0) {
      await this.vendorRepo.decrement({ id: vendorId }, 'followersCount', 1);
      await this.userRepo.decrement({ id: userId }, 'followingCount', 1);
    }
    return true;
  }

  async getMyFollowers(user: User, pagination: PaginatorInput) {
    const { page, limit } = pagination;
    return await this.followRepo.findPaginated(
      { follower: { id: user.id } },
      { createdAt: 'DESC' },
      page,
      limit,
      ['user'] as FindOptionsRelations<Follow>,
    );
  }
}
