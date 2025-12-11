# Shared Types Reference

The `src/common/types` directory centralises reusable TypeScript types and GraphQL models used throughout the project. This guide explains each export, when to use it, and the fields it contains so developers can wire them in confidently.

## Quick Reference

| Type                 | Kind              | Purpose                                                               |
| -------------------- | ----------------- | --------------------------------------------------------------------- |
| `PermissionOptions`  | Type alias        | Describes a permission tuple (`target`, `action`) consumed by guards. |
| `PermissionEnumType` | Type alias        | Represents an object map of permission action enumerations.           |
| `AuthOptions`        | Type alias        | Options accepted by the `@Auth()` decorator.                          |
| `AppBaseEntityOr<T>` | Intersection type | Builds TypeORM filter payloads that support `$or` clauses.            |
| `AppConfigType`      | Type alias        | Structure returned by config services (env, toggles, throttlers).     |
| `AppJwtToken`        | GraphQL object    | Standard token pair response for auth flows.                          |
| `AppGqlContext`      | Type alias        | Shape of the GraphQL context passed to resolvers/guards.              |

---

## `PermissionOptions`

```ts
export type PermissionOptions = {
  target: string;
  action: string;
};
```

Each permission requirement is a tuple describing the resource (`target`) and the allowed operation (`action`). Strings are used so callers can pass enums (`PermissionTargetEnum`, `DefaultPermissionActionsEnum`, etc.) without forcing direct dependencies. `AuthorizedGuard` and `GuardHelperService` consume arrays of `PermissionOptions` to validate admin capabilities.

## `PermissionEnumType`

```ts
export type PermissionEnumType = { [key: string]: string };
```

Represents a dictionary of action keys to string values. The `@GeneratePermissions()` decorator reads this shape to expose a static `permissionActionsEnum` getter. When defining custom permission action enums, ensure they match this contract (plain objects where both keys and values are strings).

## `AuthOptions`

```ts
export type AuthOptions = {
  roles?: UserRoleEnum[];
  permissions?: PermissionOptions[];
  allowUsersWithRequireSettingPassword?: boolean;
};
```

The `@Auth()` decorator accepts this payload to configure `AuthorizedGuard`:

- `roles` – Restrict handlers to specific `UserRoleEnum` values.
- `permissions` – List of `PermissionOptions` checked for admin users.
- `allowUsersWithRequireSettingPassword` – Opt-in to allow users flagged with `requireSettingPassword` to proceed.

When composing guards manually, you can replicate the same metadata using `@AllowedRoles`, `@RequiredPermissions`, and `@AllowUsersWithRequireSettingPassword`.

## `AppBaseEntityOr<T>`

```ts
export type AppBaseEntityOr<T extends AppBaseEntity> = DeepPartial<T> & {
  $or: FindOptionsWhere<T>[];
};
```

Utility combining a partial entity filter with an `$or` array compatible with TypeORM’s `FindOptionsWhere`. Use it when you need to construct repository queries like:

```ts
const where: AppBaseEntityOr<User> = {
  $or: [{ email }, { phoneNumber }],
};
const user = await userRepository.findOne({ where });
```

This keeps typing strict—`$or` must be an array of `FindOptionsWhere<T>`, while additional partial filters (`DeepPartial<T>`) can sit alongside it.

## `AppConfigType`

Structure returned by configuration providers (e.g., `app.config.ts`). Fields control global toggles and third-party integrations:

```ts
export type AppConfigType = {
  AppName: string;
  AppEmail: string;
  defaultLang: LangEnum;
  nodeEnv: string;
  phoneNumberAuth: boolean;
  allowSms: boolean;
  allowMail: boolean;
  allowNotificationPusher: boolean;
  appGeneralCurrency: CurrenciesEnum;
  monitorUserActivity: boolean;
  throttlers: ThrottlerOptions[];
};
```

Use this type to annotate config modules so IDEs surface the available toggles. The `throttlers` array feeds directly into Nest’s `ThrottlerModule` configuration.

## `AppJwtToken`

GraphQL `@ObjectType()` representing the standard token response emitted by login, refresh, or verification flows.

Fields:

| Field                   | Type                       | Description                                      |
| ----------------------- | -------------------------- | ------------------------------------------------ |
| `accessToken`           | `string`                   | Short-lived JWT used for authenticated requests. |
| `accessTokenExpiresAt`  | `Date` (`TimestampScalar`) | Expiry timestamp in epoch milliseconds.          |
| `refreshToken`          | `string`                   | Long-lived token for session refresh.            |
| `refreshTokenExpiresAt` | `Date` (`TimestampScalar`) | Refresh token expiry in epoch milliseconds.      |

Return this class directly from resolvers to keep GraphQL schemas consistent.

## `AppGqlContext`

```ts
export type AppGqlContext = {
  req: Request;
  res: Response;
  lang: LangEnum;
  token?: string;
  session?: Session | null;
  currentUser?: User;
  moduleRef: ModuleRef;
  ip?: string | null;
};
```

Represents the context object injected into GraphQL resolvers and guards. Key properties:

- `req` / `res` – Express request/response objects for reading headers, cookies, etc.
- `lang` – Preferred language (used for localization in exception filter).
- `token` – Raw authorization token extracted during request parsing.
- `session` – Hydrated session entity for the current device, if any.
- `currentUser` – Authenticated `User` entity attached by authentication middleware.
- `moduleRef` – Nest `ModuleRef` to resolve providers dynamically.
- `ip` – Optional IP address captured from headers.

When custom middleware extends the context, update this type so resolvers receive compile-time hints.

---

Keep this file updated whenever you add or evolve shared types to ensure teams have a single source of truth for contracts used across modules.
