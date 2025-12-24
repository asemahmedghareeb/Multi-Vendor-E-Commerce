import { Injectable } from '@nestjs/common';
import { Follow } from '../entities/follow.entity';
import { User } from '../../auth-base/user/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';

@Injectable()
export class FollowsService {
  constructor(
    @InjectAppRepository(Follow) private followRepo: AppRepository<Follow>,
    @InjectAppRepository(User) private userRepo: AppRepository<User>,
    @InjectAppRepository(Vendor) private vendorRepo: AppRepository<Vendor>,
  ) {}

  async follow(followerId: string, vendorId: string): Promise<boolean> {
    const user = await this.userRepo.findOneOrFail({
      where: { id: followerId },
    });
    const vendor = await this.vendorRepo.findOneOrFail({
      where: { id: vendorId },
    });

    if (user.id === vendor.userId) {
      throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
    }
    const existing = await this.followRepo.findOne({
      where: {
        followerId,
        vendorId,
      },
    });

    if (existing) return true;

    const follow = this.followRepo.create({
      follower: { id: followerId },
      vendor: { id: vendorId },
    });

    await this.followRepo.save(follow);
    await this.userRepo.increment({ id: followerId }, 'followingCount', 1);
    await this.vendorRepo.increment({ id: vendorId }, 'followersCount', 1);

    return true;
  }
  async unfollow(followerId: string, vendorId: string): Promise<boolean> {
    const result = await this.followRepo.delete({
      followerId,
      vendorId,
    });

    if (result.affected && result.affected > 0) {
      await this.vendorRepo.decrement({ id: vendorId }, 'followersCount', 1);
      await this.userRepo.decrement({ id: followerId }, 'followingCount', 1);
    }
    return true;
  }

  async getMyFollowers(user: User, pagination: PaginatorInput) {
    const { page, limit } = pagination;
    return await this.followRepo.findPaginated(
      { followerId: user.id },
      { createdAt: 'DESC' },
      page,
      limit,
      {
        follower: true,
        vendor: true,
      },
    );
  }
}
