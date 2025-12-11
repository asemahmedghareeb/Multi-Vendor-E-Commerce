import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { UserActivity } from '../entities/user-activity.entity';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { UsersActivityFilterInput } from '../dtos/inputs/users-activity-filter.input';
import { UsersActivitySortbyInput } from '../dtos/inputs/users-activity-sort-by.input';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { UsersActivitySortByEnum } from '../enums/users-activity-sort-by.enum';
import { SortDirectionEnum } from 'src/common/enums/sort-direction.enum';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectAppRepository(UserActivity)
    private readonly userActivityRepository: AppRepository<UserActivity>,
  ) {}

  async createUserActivity(activity: Partial<UserActivity>) {
    const userActivity = await this.userActivityRepository.createOne(activity);
    //todo add extra logic if needed
  }

  async findPaginateUserActivity(
    paginationInput?: PaginatorInput,
    filter?: UsersActivityFilterInput,
    sortBy?: UsersActivitySortbyInput,
  ) {
    const where: FindOptionsWhere<UserActivity> = {};
    const include: FindOptionsRelations<UserActivity> = {};

    if (filter?.minTime && filter?.maxTime) {
      where.createdAt = Between(filter.minTime, filter.maxTime);
    } else if (filter?.minTime) {
      where.createdAt = MoreThanOrEqual(filter?.minTime);
    } else if (filter?.maxTime) {
      where.createdAt = LessThanOrEqual(filter.maxTime);
    }

    if (filter?.userId) {
      where.session = {
        userId: filter.userId,
      };

      include.session = true;
    }

    const sort: FindOptionsOrder<UserActivity> = {};

    switch (sortBy?.sortBy) {
      case UsersActivitySortByEnum.CREATED_AT:
        sort.createdAt = sortBy.order || SortDirectionEnum.DESC;
        break;
      default:
        sort.createdAt = SortDirectionEnum.DESC;
        break;
    }

    return this.userActivityRepository.findPaginated(
      where,
      sort,
      paginationInput?.page,
      paginationInput?.limit,
      include,
    );
  }
}
