## Monitoring module — developer guide

This document describes the Monitoring module located at `src/modules/core/monitoring`. It explains purpose, files, runtime flow, data model, interceptor behavior, queue/processor wiring, service APIs, DTOs used for queries, and testing notes. The content describes the current code.

## Purpose

The Monitoring module captures user activity for GraphQL mutations and persists activity records asynchronously. It uses a Nest interceptor (`MonitoringInterceptor`) to observe GraphQL mutation execution, enqueues a job to a BullMQ queue (`monitoring-queue`), and a worker (`MonitoringProcessor`) consumes jobs and writes `UserActivity` records via `MonitoringService`.

## Key files

## Monitoring module — code explanation

This file describes the current code in `src/modules/core/monitoring`.

Files and responsibilities

- `monitoring.module.ts`
  - Imports `AppDatabaseModule.forFeature([UserActivity, Session])`.
  - Registers a BullMQ queue named `monitoring-queue`.
  - Provides `MonitoringService`, `UserActivityResolver`, `MonitoringProcessor`, and `SessionDataloader`.
  - Registers `MonitoringInterceptor` as an `APP_INTERCEPTOR` provider.

- `interceptors/monitoring.interceptor.ts`
  - Exports `MonitoringInterceptor` implementing `NestInterceptor`.
  - Injects `@InjectQueue('monitoring-queue')` and uses the queue to add `monitoring-job` entries.
  - Uses `GqlExecutionContext.create(context)` to obtain GraphQL info and context.
  - For GraphQL mutations (when `AppConfig.monitorUserActivity` is truthy) it records start time, and on success or error enqueues a job with `{ mutationName, success, code, executionTime, sessionId, ip }`.

- `processors/monitoring.processor.ts`
  - Decorated with `@Processor('monitoring-queue', { limiter: { duration: 3000, max: 10 } })`.
  - Constructor injects `MonitoringService`.
  - `process(job: Job<Partial<UserActivity>>)` calls `this.monitoringService.createUserActivity(job.data)` and logs/rethrows errors via `Logger.error(err)`.

- `services/monitoring.service.ts`
  - Constructor injects `@InjectAppRepository(UserActivity) userActivityRepository`.
  - `createUserActivity(activity: Partial<UserActivity>)` calls `userActivityRepository.createOne(activity)`.
  - `findPaginateUserActivity(paginationInput?, filter?, sortBy?)` builds a TypeORM `where`, `relations` (include), and `sort` objects based on `UsersActivityFilterInput` and `UsersActivitySortbyInput`, then calls `userActivityRepository.findPaginated(where, sort, page, limit, include)`.

- `entities/user-activity.entity.ts`
  - Entity `UserActivity` extends `AppBaseEntity` and defines columns:
    - `mutationName: string`
    - `success: boolean`
    - `code?: number` (nullable)
    - `executionTime: number`
    - `ip?: string | null` (text column)
    - `sessionId?: string`
  - `session: Session` ManyToOne relation joined by `sessionId`.

- DTOs and enums
  - `UsersActivityFilterInput` provides `minTime`, `maxTime`, `userId`.
  - `UsersActivitySortbyInput` provides `sortBy` and `order`.
  - `PaginatedUserActivityResponse` is created via `paginatedObjectTypeFactory(UserActivity)`.

Runtime flow

1. A GraphQL request reaches the server.
2. `MonitoringInterceptor.intercept()` runs; it ignores HTTP requests and non-mutation GraphQL operations.
3. For mutations, the interceptor records `startDate`, proceeds, and on completion (success or error) enqueues `monitoring-job` with `{ mutationName, success, code, executionTime, sessionId, ip }` to `monitoring-queue`.
4. `MonitoringProcessor` consumes `monitoring-job` and calls `MonitoringService.createUserActivity(job.data)`.
5. `MonitoringService.createUserActivity` calls `userActivityRepository.createOne(activity)`.

Query behavior (service)

- Time filters from `UsersActivityFilterInput` are mapped to TypeORM `Between`, `MoreThanOrEqual`, or `LessThanOrEqual` on `createdAt`.
- When `filter.userId` is provided, `where.session = { userId: filter.userId }` and `include.session = true`.
- Sorting uses `UsersActivitySortByEnum` (currently `CREATED_AT`) and `SortDirectionEnum`.
- The repository method `findPaginated` receives `where`, `sort`, `page`, `limit`, and `include`.

Error handling (in code)

- `MonitoringInterceptor` captures exceptions thrown by the handler and includes the HTTP status (via `err.getStatus()` when `err` is an `HttpException`) in the enqueued job payload.
- `MonitoringProcessor.process` logs errors via `Logger.error(err)` and rethrows them.

Configuration values referenced

- `AppConfig.monitorUserActivity` — used by the interceptor to determine whether to monitor.

Where to find code

- Module: `src/modules/core/monitoring/monitoring.module.ts`
- Interceptor: `src/modules/core/monitoring/interceptors/monitoring.interceptor.ts`
- Service: `src/modules/core/monitoring/services/monitoring.service.ts`
- Processor: `src/modules/core/monitoring/processors/monitoring.processor.ts`
- Entity: `src/modules/core/monitoring/entities/user-activity.entity.ts`
- DTOs: `src/modules/core/monitoring/dtos/inputs/*` and `dtos/responses/paginated-user-activity.response.ts`
