import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import {
  DeepPartial,
  Equal,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { AppBaseEntity } from '../entities/app-base.entity';
import { CursorPaginatorInput } from 'src/common/dtos/inputs/cursor-paginator.input';
import { OrderBy } from 'src/modules/app/product/dto/inputs/orderBy.input';


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

  async findCursorPaginated(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    {
      first = 15,
      cursor,
      isForward = true,
    }: CursorPaginatorInput,
    sort?: OrderBy,
    include?: FindOptionsRelations<Entity>,
    select?: FindOptionsSelect<Entity>,
  ) {
    const limit = first;

    // 1. Determine Sort Order
    // Forward (Next Page) = Oldest -> Newest (ASC)
    // Backward (Prev Page) = Newest -> Oldest (DESC)
    // const sortOrder = isForward ? 'ASC' : 'DESC';

    const queryOptions: any = {
      relations: include,
      take: limit + 1, // Peek strategy
      select,
      // order: { createdAt: sortOrder, id: sortOrder }, // Sort by both
      order: {
        [sort?.field || 'createdAt']: sort?.order || 'ASC',
      },
    };

    // 2. Decode Cursor and Build Query
    if (cursor) {
      const { createdAt, id } = this.decodeCursor(cursor);

      // If Forward (ASC): We want items > cursor
      // If Backward (DESC): We want items < cursor
      const operator = isForward ? MoreThan : LessThan;

      const cursorConditions = [
        { createdAt: operator(createdAt) }, // Condition A: Different time
        { createdAt: Equal(createdAt), id: operator(id) }, // Condition B: Same time, different ID
      ];

      // Merge User Filters with Cursor Logic
      const userWhereArray = Array.isArray(where) ? where : [where];
      const combinedWhere: any[] = [];

      userWhereArray.forEach((userConstraint) => {
        cursorConditions.forEach((cursorConstraint) => {
          combinedWhere.push({ ...userConstraint, ...cursorConstraint });
        });
      });

      queryOptions.where = combinedWhere;
    } else {
      queryOptions.where = where;
    }

    // 3. Execute Query
    const items = await this.find(queryOptions);

    // 4. Handle "Has More" Flag
    let hasMore = false;
    if (items.length > limit) {
      hasMore = true;
      items.pop(); // Remove the extra item
    }

    // 5. Re-order if Backward
    // DB returned [C, B, A] (Newest->Oldest). We want [A, B, C] for the UI.
    if (!isForward) {
      items.reverse();
    }

    // 6. Map Edges (Encode new cursors)
    const edges = items.map((item) => ({
      cursor: this.encodeCursor(item),
      node: item,
    }));

    return {
      edges,
      pageInfo: {
        // Return null if empty, otherwise grab the first/last cursor from the result
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasMore,
      },
    };
  }

  // --- Helpers ---

  private encodeCursor(item: Entity): string {
    const payload = `${item.createdAt?.getTime()}:${item.id}`;
    return Buffer.from(payload).toString('base64');
  }

  private decodeCursor(cursor: string): {
    createdAt: Date;
    id: string | number;
  } {
    const str = Buffer.from(cursor, 'base64').toString('ascii');
    const [timestamp, id] = str.split(':');

    const parsedId = isNaN(Number(id)) ? id : Number(id);

    return {
      createdAt: new Date(Number(timestamp)),
      id: parsedId,
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
