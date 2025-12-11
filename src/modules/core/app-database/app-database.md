## App Database — code explanation

This file documents the current code in `src/modules/core/app-database`.

Contents

- `AppDatabaseModule` (extends `TypeOrmModule`)
- `AppRepository<T>` (custom repository with helpers)
- `AppBaseEntity` (base entity fields and helpers)

AppDatabaseModule

- File: `src/modules/core/app-database/app-database.module.ts`
- Exports `AppDatabaseModule` class which extends `TypeOrmModule`.
- Providers array (module-level) includes a provider for `AppDataSource` using the existing `dataSource` instance from `src/config/database/typeorm.config`.
- `static forFeature(entities: EntityClassOrSchema[]): DynamicModule`:
  - Accepts an array of entity classes or schemas.
  - For each `entity` creates a provider object:
    - `provide: `${entity.name}Repository``— a string token using the entity's class`name`.
    - `useFactory: () => dataSource.getAppRepository(entity)` — returns a custom `AppRepository` instance for that entity from the configured `dataSource`.
  - Returns a `DynamicModule` with `module: AppDatabaseModule`, `providers: [...providers]`, and `exports: [...providers]`.
  - This module pattern allows other modules to call `AppDatabaseModule.forFeature([EntityA, EntityB])` and inject repositories using tokens like `'EntityARepository'`.

AppRepository<T>

- File: `src/modules/core/app-database/repositories/app.repository.ts`
- Class `AppRepository<Entity extends AppBaseEntity>` extends TypeORM's `Repository<Entity>` and adds helper methods used across the codebase.
- Methods and behavior:
  - `async findOneOrFail(options: FindOneOptions<Entity>, errorCode?: ErrorCodeEnum)`
    - Calls `this.findOne(options)`.
    - If the result is falsy, throws `AppHttpException(errorCode || ErrorCodeEnum.NOT_FOUND)`.
    - Returns the found entity.

  - `async findOneAndFail(options: FindOneOptions<Entity>, errorCode?: ErrorCodeEnum)`
    - Calls `this.findOne(options)`.
    - If a result is found, throws `AppHttpException(errorCode || ErrorCodeEnum.FORBIDDEN)`.

  - `async findPaginated(where?, sort?, page: number = 1, limit: number = 15, include?, select?)`
    - Calculates `skip = (page - 1) * limit`.
    - Calls `this.findAndCount({ where, relations: include, order: sort, take: limit, skip, select })`.
    - Returns an object `{ items: result, pageInfo: { limit, page, hasPrevious, hasNext, totalCount } }` where `hasPrevious` and `hasNext` are computed from `page`, `limit`, and `total`.

  - `async updateMany(where, input: DeepPartial<Entity>): Promise<Entity[]>`
    - Finds entities via `this.find({ where })`, assigns `input` onto each model via `Object.assign`, and saves them via `this.save(entities)`.

  - `softDeleteWithUpdate(where: FindOptionsWhere<Entity>[], input: DeepPartial<Entity>): Promise<Entity[]>`
    - Calls `updateMany` with `...input` and sets `deletedAt: Date.now()`.

  - `createOne(input: DeepPartial<Entity>)`
    - Creates an entity instance via `this.create(input)` and `this.save(entity)`.

  - `bulkCreate(input: DeepPartial<Entity>[])`
    - Calls `this.create(input)` and `this.save(entities)` returning the saved entities.

  - `async updateOneFromExistingModel(model: Entity, input: DeepPartial<Entity>)`
    - Mutates `model` with `Object.assign(model, input)` and saves it via `this.save(model)`.

  - `async deleteMany(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[])`
    - Calls `this.delete(where)` and returns `result.affected || 0`.

  - Note: A `//TODO Add cursor pagination` comment exists in the file.

AppBaseEntity

- File: `src/modules/core/app-database/entities/app-base.entity.ts`
- Abstract class `AppBaseEntity` annotated with GraphQL `@ObjectType()` and TypeORM column decorators.
- Fields and annotations:
  - `@PrimaryGeneratedColumn('uuid') id: string` — Exposed with `@Field()` and `@ApiProperty`.
  - `@CreateDateColumn({ type: 'timestamp' }) createdAt: Date` — Exposed as `@Field(() => TimestampScalar)`.
  - `@UpdateDateColumn({ type: 'timestamp' }) updatedAt: Date` — Exposed as `@Field(() => TimestampScalar)`.
  - `@DeleteDateColumn({ type: 'timestamp' }) deletedAt?: Date` — Exposed as nullable `@Field(() => TimestampScalar, { nullable: true })`.
  - Static getter `permissionsTarget` returns `this.name`.

Types and imports referenced

- `TypeOrmModule`, `DynamicModule` from `@nestjs/common`/`@nestjs/typeorm`.
- `AppDataSource` and `dataSource` are provided by the application's `src/config/database` configuration.
- `EntityClassOrSchema` is used as the input type for `forFeature`.
- `AppHttpException` and `ErrorCodeEnum` are referenced by `AppRepository` error handling.
- `FindOptionsWhere`, `FindOptionsRelations`, `FindOneOptions`, and other TypeORM types are used throughout `AppRepository` method signatures.

Injection tokens and usage

- `AppDatabaseModule.forFeature([EntityA, EntityB])` returns a module that provides and exports tokens like `'EntityARepository'` and `'EntityBRepository'`.
- Consumers inject repositories using the token, for example: `@Inject('UserRepository') private readonly userRepository: AppRepository<User>`.

Where to find code

- Module: `src/modules/core/app-database/app-database.module.ts`
- Repository: `src/modules/core/app-database/repositories/app.repository.ts`
- Base entity: `src/modules/core/app-database/entities/app-base.entity.ts`
