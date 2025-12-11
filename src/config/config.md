# Configuration Reference

The `src/config` directory centralises environment-driven settings for infrastructure layers such as database access, caching, GraphQL, and background workers. This document summarises each module, the environment variables it consumes, and how to plug it into NestJS modules.

## Quick Reference

| Module                                       | Purpose                                                           | Key exports                                       |
| -------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `app.config.ts`                              | Static application toggles (language, throttling, feature flags). | `AppConfig` (`AppConfigType`)                     |
| `app-jwt/app-jwt.config.ts`                  | JWT expiration settings for access/refresh tokens.                | `AppJwtConfig`                                    |
| `cache/cache.config.ts`                      | Redis-backed cache configuration factory.                         | `cacheConfigFactory(configService)`               |
| `database/app.datasource.ts`                 | Custom `AppDataSource` extending TypeORM `DataSource`.            | `AppDataSource` class                             |
| `database/typeorm.config.ts`                 | TypeORM connection options and exported datasource.               | `TypeOrmConfig`, `dataSource`                     |
| `graphql/graphql.config.ts`                  | GraphQL module options (context builder, schema options).         | `GqlConfig` provider                              |
| `i18n/i18n.config.ts` & `i18n.provider.ts`   | Internationalization loader and header resolver.                  | `I18nConfig`, `HeaderResolver`                    |
| `node-mailer/*`                              | Nodemailer transport options and factory.                         | `NodeMailerOptions`, `NodemailerTransportFactory` |
| `pubsub/pubsub.config.ts`                    | Redis Pub/Sub instance for GraphQL subscriptions.                 | `pubSub`                                          |
| `queue/bull.config.ts`                       | BullMQ queue configuration factory.                               | `BullConfigFactory(configService)`                |
| `validation-pipe/validation-pipe.factory.ts` | Shared `ValidationPipe` factory with localization.                | `ValidationPipeFactory(helper)`                   |

---

## `app.config.ts`

Exports a fully typed `AppConfig` object implementing `AppConfigType`. Values are sourced from environment variables using `env-var` and include feature toggles used across modules.

- **Environment variables**: `APP_NAME`, `APP_EMAIL`, `NODE_ENV` (required).
- **Defaults**: `defaultLang` fixed to `LangEnum.EN`, `appGeneralCurrency` set to `CurrenciesEnum.USD`.
- **Throttlers**: Provides a default rate limit `{ ttl: 60000, limit: 100 }` consumed by throttler modules.

Usage example:

```ts
import { AppConfig } from 'src/config/app.config';

if (AppConfig.allowMail) {
  // register mail providers
}
```

## `app-jwt/app-jwt.config.ts`

Defines constants for access and refresh token lifetimes in milliseconds. The values feed into token generation logic in the auth module.

```ts
export const AppJwtConfig = {
  accessTokenExpireIn: 15 * 60 * 1000,
  refreshTokenExpireIn: 7 * 24 * 60 * 60 * 1000,
};
```

When changing expiry durations, update this file and ensure clients refresh tokens accordingly.

## `cache/cache.config.ts`

Provides `cacheConfigFactory(configService)` which builds a cache configuration for Nest’s caching module backed by Redis via `@keyv/redis`.

- **Environment variables**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_PASSWORD`.
- **TTL**: Default time-to-live is 3 minutes (`ttl: 180` seconds) for cached entries.

Register with `CacheModule.registerAsync({ useFactory: cacheConfigFactory, inject: [ConfigService] })`.

## Database Configuration

### `database/app.datasource.ts`

Custom `AppDataSource` extends TypeORM’s `DataSource` and provides `getAppRepository()` to return the project’s enriched `AppRepository` for each entity. A proxy ensures compatibility with `typeorm-transactional` by preserving the constructor name.

Use `dataSource.getAppRepository(Entity)` whenever you need repository instances outside Nest’s DI (e.g., in migrations or transactional helpers).

### `database/typeorm.config.ts`

Defines the `TypeOrmConfig` (`DataSourceOptions`) and exports `dataSource` (an instance of `AppDataSource`). Values are pulled from environment variables using `env-var`. Entities and migrations are resolved relative to the config directory.

- **Environment variables**: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`.
- **Defaults**: `synchronize: true`, `logging: false`. Adjust for production as needed.

For CLI migrations, import this file so TypeORM picks up the same configuration.

## `graphql/graphql.config.ts`

`GqlConfig` implements `GqlOptionsFactory` and is intended for `GraphQLModule.forRootAsync({ useClass: GqlConfig })` registration.

Highlights:

- Enables `playground` only in staging environments (`NODE_ENV === 'staging'`).
- Generates schema at `schema.gql` and enables boundaries such as `csrfPrevention` and `includeStacktraceInErrorResponses: false`.
- Provides a custom `context` function that populates `AppGqlContext` using `ContextService` (session lookup, language detection, token extraction) and Nest’s `ModuleRef`.
- Subscriptions are configured for `graphql-ws` with a TODO placeholder for authentication.

When extending the context (e.g., adding loaders), update both the context builder and the `AppGqlContext` type to keep typings aligned.

## Internationalization (`i18n`)

### `i18n/i18n.config.ts`

Exports `I18nConfig` (`I18nAsyncOptions`) for `I18nModule.forRootAsync`. It:

- Sets the fallback language to `AppConfig.defaultLang` (currently English).
- Disables the built-in middleware so language resolution can be handled manually.
- Loads translation files from `src/consts/i18n` and watches for changes in development.
- Uses `HeaderResolver` to detect language from request headers or GraphQL context.

### `i18n/i18n.provider.ts`

`HeaderResolver` implements `I18nResolver`, returning `req.lang` for HTTP or `ctx.lang` for GraphQL requests. Ensure upstream middleware (e.g., `LangContextMiddleware`) sets the `lang` property on requests.

## Nodemailer

- `node-mailer/node-mailer.options.ts` maps `NodeMailerProviderEnum` values to transport options. The current project ships a single `GMAIL` configuration that reads `APP_EMAIL` and `GOOGLE_APP_PASSWORD` environment variables.
- `node-mailer/transport.factory.ts` exports `NodemailerTransportFactory`, returning a transporter configured for the Gmail provider.

To support additional providers, extend `NodeMailerOptions` and allow `NodemailerTransportFactory` to select the appropriate configuration based on runtime settings.

## Pub/Sub (`pubsub/pubsub.config.ts`)

Creates a `RedisPubSub` instance using `graphql-redis-subscriptions` and `ioredis`. Both publisher and subscriber use the same connection options derived from Redis environment variables. Share this `pubSub` instance across modules needing GraphQL subscription events.

## Queue (`queue/bull.config.ts`)

`BullConfigFactory` is an async factory for `BullModule.forRootAsync`. It returns `QueueOptions` with a Redis connection and default job behaviours (retry attempts, backoff, cleanup limits).

- **Environment variables**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`.
- **Job options**: 3 retry attempts, 3-second backoff, automatic removal after completion/failure thresholds.

## Validation Pipe (`validation-pipe/validation-pipe.factory.ts`)

`ValidationPipeFactory` produces a global `ValidationPipe` configured for:

- Automatic DTO transformation and implicit type conversion.
- Custom `exceptionFactory` that delegates to `validationPipeExceptionFactory`, injecting `AppHelperService` so validation errors are localised and mapped to `AppHttpException` codes.

Register in `main.ts` via:

```ts
const helper = app.get(AppHelperService);
app.useGlobalPipes(ValidationPipeFactory(helper));
```

---

Whenever a new configuration module is introduced or an existing one gains additional environment variables, document it here to keep service teams aligned on deployment requirements.
