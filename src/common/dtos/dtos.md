# Common DTOs Reference

Developers use the following shared DTOs to standardize GraphQL inputs and outputs across modules. This document summarizes each class, covers validation rules, and shows how to wire them into resolvers.

## Quick Reference

| DTO                          | Kind   | Purpose                                                                                  |
| ---------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `EmailInput`                 | Input  | Capture and validate a single email field.                                               |
| `PhoneNumberInput`           | Input  | Capture an E.164 phone number string.                                                    |
| `UrlInput`                   | Input  | Accept a single URL with format validation.                                              |
| `LoginDeviceInput`           | Input  | Collect device metadata whenever sessions are created.                                   |
| `RegisterUserInput`          | Input  | Standard registration payload for first/last name, email/phone, and language preference. |
| `PaginatorInput`             | Input  | Provide page/limit pagination values with defaults.                                      |
| `NullablePaginatorArgsInput` | Args   | Wraps `PaginatorInput` in GraphQL `@Args()` signatures when the argument is optional.    |
| `PageInfo`                   | Object | Return paging metadata (limit, page, total count, navigation flags).                     |

---

## Input DTOs

### `EmailInput`

Single-property DTO that enforces a non-empty email string using `class-validator`.

| Field   | Type     | Validation                                   |
| ------- | -------- | -------------------------------------------- |
| `email` | `string` | `@IsString()`, `@IsNotEmpty()`, `@IsEmail()` |

Usage example:

```ts
@Mutation(() => Boolean)
requestNewsletter(@Args('input') input: EmailInput) {
	return this.newsletterService.subscribe(input.email);
}
```

### `PhoneNumberInput`

Captures a phone number and validates that it is a non-empty E.164 string.

| Field         | Type     | Validation                                         |
| ------------- | -------- | -------------------------------------------------- |
| `phoneNumber` | `string` | `@IsString()`, `@IsNotEmpty()`, `@IsPhoneNumber()` |

Pair this input with flows that send SMS codes or require unique phone numbers.

### `UrlInput`

Ensures a single URL is provided. Useful for whitelists, callbacks, or media links.

| Field | Type     | Validation                                 |
| ----- | -------- | ------------------------------------------ |
| `url` | `string` | `@IsString()`, `@IsNotEmpty()`, `@IsUrl()` |

### `LoginDeviceInput`

GraphQL `@InputType()` used wherever we establish or update a device-bound session. Validations ensure the basic metadata is present and constrain string lengths.

| Field                 | Type         | Validation / Notes                                                                                                              |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `deviceName`          | `string`     | `@MaxLength(250)`, `@IsNotEmpty()`                                                                                              |
| `notificationToken?`  | `string`     | Optional, but if supplied must be a non-empty string up to 250 characters. Typically required when `allowNotifications = true`. |
| `allowNotifications?` | `boolean`    | Optional flag mirroring the device push preferences.                                                                            |
| `device`              | `DeviceEnum` | Required; distinguishes `DESKTOP`, `IOS`, `ANDROID`, etc.                                                                       |
| `deviceLang`          | `LangEnum`   | Optional; informs notification localization.                                                                                    |

Typical resolver signature:

```ts
@Mutation(() => AppJwtToken)
loginUserWithPassword(@Args('input') input: LoginUserWithPasswordInput) {
	// nested inside the auth input DTO
	const { loginDeviceInput } = input;
	return this.authService.loginUserWithPassword(input);
}
```

### `RegisterUserInput`

Primary registration payload for manual sign-ups. Business logic enforces that users provide at least one contact method even though the DTO itself does not mark them as required (to support reuse in admin scenarios).

| Field          | Type       | Validation                                         |
| -------------- | ---------- | -------------------------------------------------- |
| `firstName`    | `string`   | `@MinLength(3)`, `@MaxLength(10)`, `@IsNotEmpty()` |
| `lastName`     | `string`   | `@MinLength(3)`, `@MaxLength(10)`, `@IsNotEmpty()` |
| `email?`       | `string`   | `@IsEmail()`                                       |
| `phoneNumber?` | `string`   | `@IsPhoneNumber()`                                 |
| `favLang?`     | `LangEnum` | Optional localization preference.                  |

When building forms, ensure either `email` or `phoneNumber` is supplied; downstream services will reject the payload otherwise.

### `PaginatorInput` & `NullablePaginatorArgsInput`

`PaginatorInput` represents the standard pagination request. Both fields default to sensible values, so consumers can omit them.

| Field   | Type     | Validation / Default             |
| ------- | -------- | -------------------------------- |
| `page`  | `number` | `@Min(1)`, GraphQL default `1`.  |
| `limit` | `number` | `@Min(1)`, GraphQL default `15`. |

`NullablePaginatorArgsInput` is an `@ArgsType()` wrapper that makes the pagination payload optional when decorating resolver arguments:

```ts
@Query(() => UserConnection)
users(@Args() args: NullablePaginatorArgsInput) {
	return this.userService.list(args.paginate ?? { page: 1, limit: 15 });
}
```

The `@ValidateNested()` ensures class-validator runs on the nested `PaginatorInput` if present.

## Response Types

### `PageInfo`

GraphQL object used in list/connection responses to describe pagination state.

| Field         | Type      | Description                                                  |
| ------------- | --------- | ------------------------------------------------------------ |
| `limit`       | `number`  | Page size applied to the query.                              |
| `page`        | `number`  | Current page index (1-based).                                |
| `totalCount`  | `number`  | Total records matching the query.                            |
| `hasNext`     | `boolean` | Indicates whether another page exists after the current one. |
| `hasPrevious` | `boolean` | Indicates whether a prior page exists.                       |

Example shape returned from a resolver:

```ts
@ObjectType()
class UserConnection {
  @Field(() => [User])
  items: User[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
```

Use `PageInfo` consistently so clients can rely on uniform pagination metadata across modules.

---

Leverage this document whenever you introduce new resolvers or need a reminder of the validations baked into each DTO. Consistent usage keeps GraphQL schemas predictable and reduces duplicate validation logic.
