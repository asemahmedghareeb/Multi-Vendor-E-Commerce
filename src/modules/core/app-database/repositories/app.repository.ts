import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import {
  DeepPartial,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AppBaseEntity } from '../entities/app-base.entity';

/** Custom base repository extending TypeORM's Repository. */
export class AppRepository<
  Entity extends Partial<AppBaseEntity>,
> extends Repository<Entity> {
  /** Find one entity or throw NOT_FOUND (or provided errorCode). */
  async findOneOrFail(
    options: FindOneOptions<Entity>,
    errorCode?: ErrorCodeEnum,
  ) {
    const result = await this.findOne(options);
    if (!result)
      throw new AppHttpException(errorCode || ErrorCodeEnum.NOT_FOUND);
    return result;
  }

  /** Throw FORBIDDEN (or provided errorCode) when an entity matching options exists. */
  async findOneAndFail(
    options: FindOneOptions<Entity>,
    errorCode?: ErrorCodeEnum,
  ) {
    const result = await this.findOne(options);
    if (result)
      throw new AppHttpException(errorCode || ErrorCodeEnum.FORBIDDEN);
  }

  /** Find entities with pagination, sorting, relations, and selection. */
  async findPaginated(
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    sort?: FindOptionsOrder<Entity>,
    page: number = 1,
    limit: number = 15,
    include?: FindOptionsRelations<Entity>,
    select?: FindOptionsSelect<Entity>,
  ) {
    const skip = (page - 1) * limit;
    const [result, total] = await this.findAndCount({
      where: where,
      relations: include,
      order: sort,
      take: limit,
      skip,
      select,
    });

    return {
      items: result,
      pageInfo: {
        limit, // Items per page
        page, // Current page number
        hasPrevious: page > 1, // If there is a previous page
        hasNext: skip + limit < total, // If there is a next page
        totalCount: total, // Total number of items
      },
    };
  }

  /** Update multiple entities matching where with input. */
  async updateMany(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    input: DeepPartial<Entity>,
  ): Promise<Entity[]> {
    const entities = await this.find({
      where,
    });
    entities.forEach((model) => Object.assign(model, input));
    return this.save(entities);
  }

  /** Soft-delete via update (sets deletedAt and other input). */
  softDeleteWithUpdate(
    where: FindOptionsWhere<Entity>[],
    input: DeepPartial<Entity>,
  ): Promise<Entity[]> {
    return this.updateMany(where, { ...input, deletedAt: Date.now() });
  }

  /** Create and save a single entity. */
  createOne(input: DeepPartial<Entity>) {
    const entity = this.create(input);
    return this.save(entity);
  }

  /** Create and save multiple entities. */
  bulkCreate(input: DeepPartial<Entity>[]) {
    const entities = this.create(input);
    return this.save(entities);
  }

  /** Update an existing model instance and save it. */
  async updateOneFromExistingModel(model: Entity, input: DeepPartial<Entity>) {
    Object.assign(model, input);
    return this.save(model);
  }

  /** Delete multiple entities and return affected count. */
  async deleteMany(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ) {
    const result = await this.delete(where);
    return result.affected || 0;
  }

  // TODO: Add cursor pagination
}
