import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from 'src/users/entities/user.entity';
import { Vendor } from 'src/vendors/entities/vendor.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followRepo: Repository<Follow>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Vendor) private vendorRepo: Repository<Vendor>,
  ) {}

  async follow(userId: string, vendorId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });

    if (!user || !vendor) return false;

    if (user.id === vendor.userId) {
      throw new BadRequestException('follow.CANT_FOLLOW_YOURSELF');
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
    }

    return true;
  }

  async getMyFollows(userId: string): Promise<Follow[]> {
    return this.followRepo.find({
      where: { follower: { id: userId } },
      relations: ['vendor'],
    });
  }
}
