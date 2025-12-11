## App Helper — code explanation

This file describes the current code in `src/modules/core/app-helper`.

## What does this do

Provides globally available helper services for common application tasks:

- `AppHelperService` — utilities for random string/number generation, entity code generation with prefixes, Arabic text serialization, and localization via `I18nService`.
- `AuthHelperService` — password hashing utility using `bcrypt`.
- `GuardHelperService` — permission validation logic that queries `AdminGroup` and its permissions from the database and validates whether a `User` has required permissions.

## How it works

- `AppHelperModule` is decorated with `@Global()` and registers `AppHelperService`, `AuthHelperService`, and `GuardHelperService` as providers and exports them for use across the application.
- `AppHelperService.generateEntityCodeWithPrefix(prefix, repo)` generates a prefixed code string, checks uniqueness by calling `repo.findOne({ where: { code } })`, retries up to 10 times, and throws `AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR)` on repeated failures or repository errors.
- `AppHelperService.localize(key, context, lang)` delegates to `I18nService.t(...)` and serializes the result for Arabic (`LangEnum.AR`) by wrapping it with Unicode isolation characters.
- `AuthHelperService.hashPassword(password)` calls `bcrypt.hash(password, 12)` and returns the hashed string.
- `GuardHelperService.validateUserHasPermission(user, requiredPermissions, exception)` loads the `AdminGroup` for `user.adminGroupId` with `adminGroupPermissions.permission` relation, builds a lookup map of permission codes, and throws the provided `exception` when any required permission key is missing.

Files and responsibilities

- `app-helper.module.ts`
  - Decorated with `@Global()` and `@Module({ ... })`.
  - Imports `AppDatabaseModule.forFeature([AdminGroup])`.
  - Provides and exports `AppHelperService`, `AuthHelperService`, and `GuardHelperService`.

- `services/app-helper.service.ts` (`AppHelperService`)
  - Constructor injects `I18nService` from `nestjs-i18n`.
  - Methods:
    - `generateRandomString(length: number, characterSet: string): string`
      - Generates and returns a random string of the requested length using the provided character set.

    - `generateRandomNumber(length: number): string`
      - Calls `generateRandomString` with the digits `'0123456789'` and returns the result.

    - `async generateEntityCodeWithPrefix<T extends AppBaseEntity & { code: string }>(prefix: CodePrefixEnum, repo: AppRepository<T>): Promise<string>`
      - Generates codes with the provided `prefix` and an 8-digit random numeric suffix.
      - Performs up to 10 attempts; if the counter reaches 10 throws `AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR)`.
      - For each attempt calls `repo.findOne({ where: { code } })` to check uniqueness.
      - Throws `AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR)` on repository errors.
      - Returns the generated unique code string.

    - `serializeArabic(text: string): string`
      - Wraps `text` with Unicode Right-to-Left-Isolate and Pop Directional Isolate characters and returns the result.

    - `localize(key: string, context: {}, lang?: LangEnum): string`
      - Calls `this.i18nService.t(key, { args: context, lang })` and casts the result to `string`.
      - If `lang == LangEnum.AR` returns the serialized Arabic variant via `serializeArabic`; otherwise returns the localized string.

- `services/auth-helper.service.ts` (`AuthHelperService`)
  - Methods:
    - `async hashPassword(password: string): Promise<string>`
      - Returns `bcrypt.hash(password, 12)`.

- `services/guard-helper.service.ts` (`GuardHelperService`)
  - Constructor injects `@InjectAppRepository(AdminGroup) adminGroupRepository: AppRepository<AdminGroup>`.
  - Methods:
    - `async validateUserHasPermission(user: User, requiredPermissions: PermissionOptions[], exception: AppHttpException)`
      - If `user.adminGroupId` is falsy, throws the provided `exception`.
      - Loads `userGroup` via `adminGroupRepository.findOne` with `where: { id: user.adminGroupId }` and `relations: { adminGroupPermissions: { permission: true } }`.
      - Builds `userPermissionsVis: Record<string, boolean>` by iterating `userGroup.adminGroupPermissions` and setting keys by `permission.code` to `true`.
      - Iterates `requiredPermissions` and for each computes a lookup key `${requiredPermission.target}.${requiredPermission.action}`; if not present in `userPermissionsVis` throws `exception`.

- `enums/code-prefix.enum.ts` (`CodePrefixEnum`)
  - Exports enum values:
    - `USER = 'U'`
    - `SECURITY_GROUP = 'R'`
    - `FAQ = 'FAQ'`

Types and imports referenced

- `I18nService` from `nestjs-i18n` is used by `AppHelperService.localize`.
- `AppRepository<T>` is the repository type used by `generateEntityCodeWithPrefix` and `GuardHelperService` repository injection.
- `AppHttpException` and `ErrorCodeEnum` are used for error handling.
- `AppBaseEntity` is used as a generic constraint for entities passed to `generateEntityCodeWithPrefix`.
- `User`, `AdminGroup`, and `PermissionOptions` are application entities/types referenced by the guard helper.

Where to find code

- Module: `src/modules/core/app-helper/app-helper.module.ts`
- AppHelperService: `src/modules/core/app-helper/services/app-helper.service.ts`
- AuthHelperService: `src/modules/core/app-helper/services/auth-helper.service.ts`
- GuardHelperService: `src/modules/core/app-helper/services/guard-helper.service.ts`
- CodePrefixEnum: `src/modules/core/app-helper/enums/code-prefix.enum.ts`
