# Common Enums Reference

This document summarizes each enum exported from `src/common/enums`. Use it as a guide when exposing new GraphQL fields, validating inputs, or throwing domain-specific errors.

## Quick Reference

| Enum                           | Purpose                                                       | Typical Usage                                                        |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `AdminGroupScopeEnum`          | Controls the reach of admin permission groups.                | Restricting admin roles to a scope (currently only `GLOBAL`).        |
| `CurrenciesEnum`               | Canonical list of supported ISO currency codes.               | Price models, money scalars, currency dropdowns.                     |
| `DefaultPermissionActionsEnum` | CRUD-style actions used in permission seeds.                  | Composing permission tuples (`target`, `action`).                    |
| `DeviceEnum`                   | Enumerates supported client device categories.                | `LoginDeviceInput.device` and session tracking.                      |
| `ErrorCodeEnum`                | Central catalogue of application errors (HTTP + domain).      | Throwing `AppHttpException` instances.                               |
| `LangEnum`                     | Supported UI/notification languages.                          | `favLang`, notification localization, `LoginDeviceInput.deviceLang`. |
| `NodeMailerProviderEnum`       | Identifies which mail provider implementation should be used. | Configuring the node mailer driver.                                  |
| `SortDirectionEnum`            | Sort direction helper.                                        | GraphQL filtering/pagination args.                                   |
| `UserRoleEnum`                 | Primary user roles in the system.                             | Guards, seeding admin accounts.                                      |
| `ValidationErrorMessageEnum`   | Keys used for custom validation error messages.               | Mapping validator failures to translation keys.                      |

---

## `AdminGroupScopeEnum`

```ts
export enum AdminGroupScopeEnum {
  GLOBAL = 'GLOBAL',
  // TODO add needed scopes
}
```

Currently only `GLOBAL` is available, allowing admin groups to operate system-wide. Future scopes (e.g., tenant, region) should be appended here and consumed wherever admin permissions are resolved.

Because the enum is registered with GraphQL via `registerEnumType`, you can expose it directly in schemas:

```ts
@Field(() => AdminGroupScopeEnum)
scope: AdminGroupScopeEnum;
```

## `CurrenciesEnum`

A comprehensive map of supported currencies grouped by region with ISO 4217 codes stored in lowercase. The enum is registered with GraphQL (`CurrenciesEnum`) for client-side introspection.

Highlights:

- **Arab countries**: `egp`, `sar`, `aed`, …
- **Europe**: `eur`, `gbp`, `chf`, `rub`, `uah`, etc.
- **Africa**: `ngn`, `ghs`, `xof`, `xaf`, …
- **Asia**: `inr`, `cny`, `jpy`, `sgd`, …
- **Americas**: `usd`, `cad`, `brl`, `mxn`, …
- **Oceania**: `aud`, `nzd`, `fjd`, …

When extending the enum, keep the values lowercase to stay consistent with existing DTOs and scalars. Prefer adding ISO-compliant codes only.

## `DefaultPermissionActionsEnum`

```ts
export enum DefaultPermissionActionsEnum {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
```

Used as the default action set when decorators such as `@GeneratePermissions()` don’t receive a custom enum. When defining permission targets, combine these actions with resource enums to describe allowed operations.

## `DeviceEnum`

Represents the device category reported by clients. Registered with GraphQL as `DeviceEnum`.

| Value     | Description                       |
| --------- | --------------------------------- |
| `DESKTOP` | Browser-based or desktop clients. |
| `IOS`     | Apple iOS mobile devices.         |
| `ANDROID` | Android mobile devices.           |

Clients must supply one of these when creating sessions (`LoginDeviceInput`). Add new values if you support additional platforms (e.g., `TV` or `WEB`), and update validation accordingly.

## `ErrorCodeEnum`

Centralizes error codes used across exceptions. The enum mixes HTTP status codes and custom domain codes. Keep the following ranges in mind when adding entries:

| Range     | Domain                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| 200–599   | Aligned with HTTP status codes (`BAD_REQUEST_EXCEPTION`, `UNAUTHORIZED`, etc.).            |
| 800–899   | File uploader errors (`INVALID_FILE_UPLOAD`, `FILE_TOO_LARGE`, …).                         |
| 1000–1299 | Authentication/user management errors (e.g., `USER_DOES_NOT_EXIST`, `NOT_PROVIDED_EMAIL`). |
| 1300–1349 | Notifications.                                                                             |
| 1350–1399 | Region/country catalog.                                                                    |
| 1400–1499 | Payment.                                                                                   |
| 2000+     | Miscellaneous domain areas (FAQ, blog, etc.).                                              |

When throwing an `AppHttpException`, use these codes to help the client map failures to UX-friendly messages. Consult the enum file for specific names before introducing new ones to avoid collisions.

## `LangEnum`

Two-letter lowercase language keys registered as `LangEnum` for GraphQL.

| Value | Meaning |
| ----- | ------- |
| `en`  | English |
| `ar`  | Arabic  |

These values power localization for notifications, email templates, and default language settings (`favLang`).

## `NodeMailerProviderEnum`

Currently identifies the mail transport provider. Default value:

- `GMAIL` – use the Gmail/Google SMTP transport provided by the node mailer module.

When adding new providers (e.g., `SES`, `MAILGUN`), extend this enum and wire corresponding configuration options under `src/common/config/node-mailer`.

## `SortDirectionEnum`

Canonical sort direction values, registered with GraphQL as `SortDirectionEnum`.

| Value  | Description      |
| ------ | ---------------- |
| `ASC`  | Ascending order  |
| `DESC` | Descending order |

Use this enum in filtering DTOs so clients can request deterministic ordering while benefiting from GraphQL enum introspection.

## `UserRoleEnum`

Represents high-level roles, registered as `UserRoleEnum` for GraphQL.

| Value   | Description                                        |
| ------- | -------------------------------------------------- |
| `ADMIN` | Platform administrators with elevated permissions. |
| `USER`  | Standard authenticated users.                      |

Additional roles should be appended here and reflected in guards (e.g., `@AllowedRoles`). Keep the `TODO` comment as a reminder to expand the list when the domain evolves.

## `ValidationErrorMessageEnum`

Stores translation keys for validation errors. Currently includes:

- `TEST_INPUT_MAX_LENGTH`

Use these keys when translating `class-validator` errors (e.g., via `i18n`). Add new entries alongside validator pipes to centralize message identifiers.

---

### Tips for Working with Enums

- Whenever you add a new enum that needs to appear in the GraphQL schema, call `registerEnumType` so clients can discover valid values via introspection.
- Keep value casing consistent with existing conventions (`lowercase` for ISO codes, `UPPERCASE` for identifiers) to avoid breaking comparisons.
- Update accompanying documentation (`decorators.md`, DTO docs) whenever an enum impacts a shared input or response type.
