# Auth API Client Guide

This guide explains every authentication-related GraphQL operation available to client applications. For each query or mutation you will find the purpose, required authentication state, input payload, and a sample request/response pair so you can integrate quickly and confidently.

## 1. Getting Started

- **Endpoint**: All examples assume your environment exposes GraphQL at `POST <BASE_URL>/graphql`.
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` when a mutation or query requires an access token (noted per operation).
  - `x-lang: en` or `x-lang: ar` (optional) to help the server localize notifications, responses, and error messages.
- **Tokens**:
  - Access tokens expire quickly (15 minutes by default) and are required for most authenticated calls.
  - Refresh tokens live longer (7 days by default) and are only supplied to the `refreshToken` mutation.
- **Device Metadata**: Any operation that accepts `LoginDeviceInput` must provide:
  - `deviceName` (string identifying the client device)
  - `device` (`DESKTOP`, `IOS`, `ANDROID`)
  - `deviceLang` (`EN`, `AR`)
  - `allowNotifications` (boolean)
  - `notificationToken` (string, required when `allowNotifications` is `true`)

> **Tip**: Use GraphQL variables to keep requests tidy. All examples show both the GraphQL document and the JSON variables payload.

## 2. Typical Flows at a Glance

1. **Discover login options** → `getUserLoginOptions`
2. **Register** → `registerUser` or `socialRegisterUser`
3. **Request verification codes** → `requestVerifyUserEmailVerificationCode`, `requestVerifyUserPhoneNumberVerificationCode`, or login/update variants
4. **Confirm ownership** → `verifyUserEmail` / `verifyUserPhoneNumber`
5. **Log in** → password, email OTP, phone OTP, or social login mutation
6. **Maintain session** → `currentSession`, `refreshToken`, `updateCurrentSession`, `logoutUser`
7. **Manage account** → password reset/change, profile updates, contact updates, social linking

Each step is detailed below.

## 3. Query Operations

### 3.1 `getUserLoginOptions`

- **Purpose**: Check which login strategies are available for a user identifier.
- **Authentication**: Not required.
- **Input Fields**:
  - `emailOrPhoneNumber` (`String!`) – email or phone to probe.

```graphql
query GetUserLoginOptions($identifier: String!) {
  getUserLoginOptions(emailOrPhoneNumber: $identifier) {
    passwordStrategy
    emailVerificationCodeStrategy
    phoneNumberVerificationCodeStrategy
    socialProviders
  }
}
```

```json
{
  "identifier": "lina@example.com"
}
```

```json
{
  "data": {
    "getUserLoginOptions": {
      "passwordStrategy": true,
      "emailVerificationCodeStrategy": true,
      "phoneNumberVerificationCodeStrategy": false,
      "socialProviders": ["GOOGLE"]
    }
  }
}
```

### 3.2 `me`

- **Purpose**: Fetch the authenticated user profile.
- **Authentication**: Access token required.

```graphql
query Me {
  me {
    id
    firstName
    lastName
    email
    phoneNumber
    favLang
    isVerified
    role
    requireSettingPassword
  }
}
```

```json
{
  "data": {
    "me": {
      "id": "usr_123",
      "firstName": "Lina",
      "lastName": "Saad",
      "email": "lina@example.com",
      "phoneNumber": "+15551234567",
      "favLang": "EN",
      "isVerified": true,
      "role": "USER",
      "requireSettingPassword": false
    }
  }
}
```

### 3.3 `currentSession`

- **Purpose**: Retrieve device-specific session details.
- **Authentication**: Access token required.

```graphql
query CurrentSession {
  currentSession {
    id
    deviceName
    device
    allowNotifications
    accessExpiryDate
    refreshExpiryDate
    lang
  }
}
```

```json
{
  "data": {
    "currentSession": {
      "id": "ses_a1b2",
      "deviceName": "Lina MacBook",
      "device": "DESKTOP",
      "allowNotifications": true,
      "accessExpiryDate": "2025-09-25T11:30:42.000Z",
      "refreshExpiryDate": "2025-10-02T11:15:42.000Z",
      "lang": "EN"
    }
  }
}
```

## 4. Registration & Verification

### 4.1 `registerUser`

- **Purpose**: Create a user with email/phone and optional password.
- **Authentication**: Not required.
- **Input** (`ManualRegisterWithPasswordInput`):
  - `firstName`, `lastName`, `email`, `phoneNumber`, `favLang`
  - `password` (optional strong password; required later via `changeUserPassword` if omitted)

```graphql
mutation RegisterUser($input: ManualRegisterWithPasswordInput!) {
  registerUser(input: $input) {
    id
    firstName
    lastName
    email
    phoneNumber
    favLang
    isVerifiedEmail
    isVerifiedPhoneNumber
    requireSettingPassword
  }
}
```

```json
{
  "input": {
    "firstName": "Lina",
    "lastName": "Saad",
    "email": "lina@example.com",
    "phoneNumber": "+15551234567",
    "favLang": "EN",
    "password": "StrongPassw0rd!"
  }
}
```

```json
{
  "data": {
    "registerUser": {
      "id": "usr_123",
      "firstName": "Lina",
      "lastName": "Saad",
      "email": "lina@example.com",
      "phoneNumber": "+15551234567",
      "favLang": "EN",
      "isVerifiedEmail": false,
      "isVerifiedPhoneNumber": false,
      "requireSettingPassword": false
    }
  }
}
```

### 4.2 `socialRegisterUser`

- **Purpose**: Register using a social provider token.
- **Authentication**: Not required.
- **Input** (`SocialRegisterUserInput`):
  - `token`, `socialProvider`
  - Optional `firstName`, `lastName`, `email`, `phoneNumber`, `favLang` _(only include `email` when the provider does not return one; providing a different email than the provider supplies causes the server to throw an `AppHttpException` with code `EMAIL_PROVIDED_BOTH_MANUALLY_AND_BY_SOCIAL_PROVIDE`)_
  - Optional `loginDeviceInput` to start a session immediately

```graphql
mutation SocialRegisterUser($input: SocialRegisterUserInput!) {
  socialRegisterUser(input: $input) {
    id
    email
    isVerifiedEmail
    jwtAutToken {
      accessToken
      refreshToken
      accessTokenExpiresAt
      refreshTokenExpiresAt
    }
  }
}
```

```json
{
  "input": {
    "token": "<google-id-token>",
    "socialProvider": "GOOGLE",
    "favLang": "EN",
    "loginDeviceInput": {
      "deviceName": "Pixel 9",
      "device": "ANDROID",
      "deviceLang": "EN",
      "allowNotifications": true,
      "notificationToken": "ExpoPushToken123"
    }
  }
}
```

```json
{
  "data": {
    "socialRegisterUser": {
      "id": "usr_568",
      "email": "lina@example.com",
      "isVerifiedEmail": true,
      "jwtAutToken": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi...",
        "accessTokenExpiresAt": "2025-09-25T11:30:42.000Z",
        "refreshTokenExpiresAt": "2025-10-02T11:15:42.000Z"
      }
    }
  }
}
```

### 4.3 Request Verification Codes

All verification-code mutations return `Boolean` (`true` on success). Throttling rules limit a new code to once every 2 minutes and codes expire after 10 minutes.

| Mutation                                                                                 | Purpose                                        | Authentication     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| `requestVerifyUserEmailVerificationCode(userId)`                                         | Send verification email for admin-managed user | Admin access token |
| `requestVerifyUserPhoneNumberVerificationCode(userId)`                                   | Send verification SMS for admin-managed user   | Admin access token |
| `requestLoginUserVerificationCodeWithEmail(email)`                                       | Email OTP for login                            | None               |
| `requestLoginUserVerificationCodeWithPhoneNumber(phoneNumber)`                           | SMS OTP for login                              | None               |
| `requestUpdateUserEmailVerificationCode(newEmail)`                                       | Email OTP for updating contact                 | Access token       |
| `requestUpdateUserPhoneNumberVerificationCode(newPhoneNumber)`                           | SMS OTP for updating contact                   | Access token       |
| `requestResetUserPasswordVerificationCode(emailOrPhoneNumber, verificationCodeStrategy)` | OTP for password reset                         | None               |

> **SMS provider requirement**: Any mutation that sends an SMS (e.g., login, verification, or update flows) will throw an `AppHttpException` with `NOT_IMPLEMENTED` if the backend has no SMS provider configured.

Example (`requestLoginUserVerificationCodeWithEmail`):

```graphql
mutation RequestLoginCode($email: String!) {
  requestLoginUserVerificationCodeWithEmail(email: $email)
}
```

```json
{
  "email": "lina@example.com"
}
```

```json
{
  "data": {
    "requestLoginUserVerificationCodeWithEmail": true
  }
}
```

### 4.4 Confirming Verification

#### `verifyUserEmail`

- **Purpose**: Confirm email ownership with a 4-digit OTP.
- **Authentication**: Not required if using code from login or registration flow.
- **Input** (`VerifyUserInput`): `code`, `userId`, optional `loginDeviceInput` to auto-create a session.

```graphql
mutation VerifyUserEmail($input: VerifyUserInput!) {
  verifyUserEmail(input: $input) {
    id
    email
    isVerifiedEmail
    jwtAutToken {
      accessToken
      refreshToken
    }
  }
}
```

```json
{
  "input": {
    "code": "4821",
    "userId": "usr_123",
    "loginDeviceInput": {
      "deviceName": "iPhone 15",
      "device": "IOS",
      "deviceLang": "EN",
      "allowNotifications": false
    }
  }
}
```

```json
{
  "data": {
    "verifyUserEmail": {
      "id": "usr_123",
      "email": "lina@example.com",
      "isVerifiedEmail": true,
      "jwtAutToken": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      }
    }
  }
}
```

#### `verifyUserPhoneNumber`

Identical to `verifyUserEmail` but confirms the phone number.

## 5. Login Mutations

### 5.1 `loginUserWithPassword`

- **Purpose**: Authenticate using password.
- **Authentication**: Not required (login).
- **Input** (`LoginUserWithPasswordInput`):
  - `emailOrPhoneNumber`
  - `password`
  - `loginDeviceInput`

```graphql
mutation LoginWithPassword($input: LoginUserWithPasswordInput!) {
  loginUserWithPassword(input: $input) {
    id
    email
    jwtAutToken {
      accessToken
      refreshToken
      accessTokenExpiresAt
      refreshTokenExpiresAt
    }
  }
}
```

```json
{
  "input": {
    "emailOrPhoneNumber": "lina@example.com",
    "password": "StrongPassw0rd!",
    "loginDeviceInput": {
      "deviceName": "Lina MacBook",
      "device": "DESKTOP",
      "deviceLang": "EN",
      "allowNotifications": true,
      "notificationToken": "BrowserPushToken123"
    }
  }
}
```

```json
{
  "data": {
    "loginUserWithPassword": {
      "id": "usr_123",
      "email": "lina@example.com",
      "jwtAutToken": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi...",
        "accessTokenExpiresAt": "2025-09-25T12:00:42.000Z",
        "refreshTokenExpiresAt": "2025-10-02T11:45:42.000Z"
      }
    }
  }
}
```

### 5.2 `loginUserWithEmailVerificationCode`

```graphql
mutation LoginWithEmailOtp($input: LoginUserWithEmailVerificationCodeInput!) {
  loginUserWithEmailVerificationCode(input: $input) {
    id
    email
    jwtAutToken {
      accessToken
      refreshToken
    }
  }
}
```

```json
{
  "input": {
    "email": "lina@example.com",
    "code": "4821",
    "loginDeviceInput": {
      "deviceName": "Pixel 9",
      "device": "ANDROID",
      "deviceLang": "EN",
      "allowNotifications": false
    }
  }
}
```

### 5.3 `loginUserWithPhoneNumberVerificationCode`

Similar to the email OTP mutation but uses `phoneNumber` instead of `email`.

### 5.4 `loginUserWithSocialAccount`

- Provide the provider token and `LoginDeviceInput`.

```graphql
mutation SocialLogin($input: SocialLoginInput!) {
  loginUserWithSocialAccount(input: $input) {
    id
    email
    jwtAutToken {
      accessToken
      refreshToken
    }
  }
}
```

## 6. Session Management

### 6.1 `refreshToken`

- **Purpose**: Rotate token pair using a refresh token.
- **Authentication**: Supply refresh token in `Authorization` header.
- **Input**: none.

```graphql
mutation RefreshToken {
  refreshToken {
    accessToken
    refreshToken
    accessTokenExpiresAt
    refreshTokenExpiresAt
  }
}
```

```json
{
  "data": {
    "refreshToken": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "accessTokenExpiresAt": "2025-09-25T12:30:42.000Z",
      "refreshTokenExpiresAt": "2025-10-02T12:15:42.000Z"
    }
  }
}
```

### 6.2 `updateCurrentSession`

- **Purpose**: Toggle language or notification settings for the active session.
- **Authentication**: Access token required.
- **Input** (`UpdateSessionInput`): `lang`, `allowNotifications`, `notificationToken`.

```graphql
mutation UpdateSession($input: UpdateSessionInput!) {
  updateCurrentSession(input: $input)
}
```

```json
{
  "input": {
    "lang": "AR",
    "allowNotifications": true,
    "notificationToken": "ExpoPushToken456"
  }
}
```

```json
{
  "data": {
    "updateCurrentSession": true
  }
}
```

### 6.3 `logoutUser`

- **Purpose**: Destroy the active session.
- **Authentication**: Access token required.

```graphql
mutation Logout {
  logoutUser
}
```

```json
{
  "data": {
    "logoutUser": true
  }
}
```

## 7. Password Management

### 7.1 `requestResetUserPasswordVerificationCode`

- See Section 4.3 for sample; use strategy `EMAIL` or `PHONE_NUMBER` when both contacts exist.

### 7.2 `resetUserPassword`

- **Purpose**: Complete reset using OTP.
- **Authentication**: Not required.
- **Input** (`ResetUserPasswordInput`): `emailOrPhoneNumber`, `code`, `newPassword`.

```graphql
mutation ResetPassword($input: ResetUserPasswordInput!) {
  resetUserPassword(input: $input)
}
```

```json
{
  "input": {
    "emailOrPhoneNumber": "lina@example.com",
    "code": "9375",
    "newPassword": "NewStrongPassw0rd!"
  }
}
```

```json
{
  "data": {
    "resetUserPassword": true
  }
}
```

### 7.3 `changeUserPassword`

- **Purpose**: Change password while logged in.
- **Authentication**: Access token required.
- **Input** (`ChangeUserPasswordInput`): `oldPassword` (required when user already has a password), `newPassword`.

```graphql
mutation ChangePassword($input: ChangeUserPasswordInput!) {
  changeUserPassword(input: $input)
}
```

```json
{
  "input": {
    "oldPassword": "StrongPassw0rd!",
    "newPassword": "EvenStrongerPassw0rd!"
  }
}
```

```json
{
  "data": {
    "changeUserPassword": true
  }
}
```

## 8. Profile & Contact Updates

### 8.1 `updateUserInfo`

- **Purpose**: Update first name, last name, or preferred language.
- **Authentication**: Access token required.
- **Input** (`updateUserInfo`): `firstName`, `lastName`, `favLang` (all optional).

```graphql
mutation UpdateUserInfo($input: updateUserInfo!) {
  updateUserInfo(input: $input)
}
```

```json
{
  "input": {
    "firstName": "Lina",
    "lastName": "Hassan",
    "favLang": "AR"
  }
}
```

```json
{
  "data": {
    "updateUserInfo": true
  }
}
```

### 8.2 `updateUserEmail`

- **Purpose**: Swap the logged-in user’s email address after proving ownership of the new address.
- **Authentication**: Access token required (user must already be authenticated).
- **Prerequisite**: Call `requestUpdateUserEmailVerificationCode(newEmail)` first. The backend verifies that:
  - the caller is not the super admin (super admin email changes are blocked),
  - the new email is not already verified by another account (duplicates are rejected with `VERIFIED_EMAIL_EXIST`),
  - throttling rules (2-minute cooldown, 10-minute expiry) are respected.
  On success, the server sends a four-digit OTP to the **new** email.
- **Input**: `code` (string) — the OTP delivered to the new email address.
- **What happens**:
  1. `updateUserEmail` consumes the OTP via `UserVerificationCodeService`; invalid, expired, or previously used codes trigger the corresponding error (`INVALID_VERIFICATION_CODE`, `EXPIRED_VERIFICATION_CODE`, or `VERIFICATION_CODE_ALREADY_USED`).
  2. The user’s email is updated transactionally. Any other accounts using the same email have it nulled to maintain uniqueness.
  3. `isVerifiedEmail` is set to `true`, so the new email is immediately trusted.
  4. Existing sessions remain valid; there is no forced logout.

```graphql
mutation UpdateEmail($code: String!) {
  updateUserEmail(code: $code)
}
```

```json
{
  "code": "7150"
}
```

```json
{
  "data": {
    "updateUserEmail": true
  }
}
```

### 8.3 `updateUserPhoneNumber`

- **Purpose**: Replace the authenticated user’s phone number after they confirm access to the new number.
- **Authentication**: Access token required.
- **Prerequisite**: Call `requestUpdateUserPhoneNumberVerificationCode(newPhoneNumber)` first. The resolver ensures the new phone number is not already verified for another account and enforces the same OTP throttling/expiry rules.
- **Input**: `code` (string) — the OTP sent by SMS to the new phone number.
- **What happens**:
  1. The mutation validates and consumes the OTP. Incorrect or expired codes surface the same `UserVerificationCode` errors as the email flow.
  2. The user’s phone number is swapped in a transaction; if another account had that number, it is cleared to avoid duplicates.
  3. `isVerifiedPhoneNumber` flips to `true` so the new number becomes login-eligible immediately.
  4. Sessions persist; clients don’t need to refresh tokens after the update.

Implementation and response shape mirror the email mutation:

```graphql
mutation UpdatePhone($code: String!) {
  updateUserPhoneNumber(code: $code)
}
```

```json
{
  "code": "8241"
}
```

```json
{
  "data": {
    "updateUserPhoneNumber": true
  }
}
```

## 9. Social Account Linking

### 9.1 `linkSocialAccount`

- **Purpose**: Attach a new social provider to an authenticated user.
- **Authentication**: Access token required.
- **Input** (`LinkSocialAccountInput`): `token`, `socialProvider`.

```graphql
mutation LinkSocial($input: LinkSocialAccountInput!) {
  linkSocialAccount(input: $input)
}
```

```json
{
  "input": {
    "token": "<facebook-access-token>",
    "socialProvider": "FACEBOOK"
  }
}
```

```json
{
  "data": {
    "linkSocialAccount": true
  }
}
```

### 9.2 `unlinkSocialAccount`

- **Purpose**: Remove a linked provider.
- **Authentication**: Access token required.
- **Input**: `socialProvider`.

> **Guardrail to warn users about**: The backend prevents unlinking if that provider is the only active login strategy. Specifically, when the user has no password set and only one social provider linked, the resolver throws an `AppHttpException` with `BAD_REQUEST_EXCEPTION` and the message `<PROVIDER> is the only provider the user can login with!`. Prompt the user to add another login method (set a password or link a different provider) before retrying.

```graphql
mutation UnlinkSocial($provider: SocialProviderEnum!) {
  unlinkSocialAccount(socialProvider: $provider)
}
```

```json
{
  "provider": "FACEBOOK"
}
```

```json
{
  "data": {
    "unlinkSocialAccount": true
  }
}
```

### 9.3 `registerSocialAccountForExistingUser`

- **Purpose**: Convert an existing verified account into one that can log in via social provider (issues new tokens).
- **Authentication**: None (uses social token) but requires verified contact alignment.
- **Input** (`RegisterSocialAccountForExistingUser`): `token`, `socialProvider`, `loginDeviceInput`.

```graphql
mutation RegisterSocialForExisting(
  $input: RegisterSocialAccountForExistingUser!
) {
  registerSocialAccountForExistingUser(input: $input) {
    id
    email
    jwtAutToken {
      accessToken
      refreshToken
    }
  }
}
```

```json
{
  "input": {
    "token": "<google-id-token>",
    "socialProvider": "GOOGLE",
    "loginDeviceInput": {
      "deviceName": "Safari on Mac",
      "device": "DESKTOP",
      "deviceLang": "EN",
      "allowNotifications": false
    }
  }
}
```

```json
{
  "data": {
    "registerSocialAccountForExistingUser": {
      "id": "usr_123",
      "email": "lina@example.com",
      "jwtAutToken": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      }
    }
  }
}
```

## 10. Administrative Mutations

The following calls are restricted to administrators and require additional permission checks enforced by the server:

- `requestVerifyUserEmailVerificationCode(userId)`
- `requestVerifyUserPhoneNumberVerificationCode(userId)`
- `adminCreateAdmin` (creates admin accounts; not covered in detail for client apps)

Ensure the authenticated admin belongs to a group with the correct permission target/action before invoking these operations.

## 11. Error Handling Reference

Common error codes surfaced through `GraphQL errors[0].extensions.code` (map to HTTP 400/401 inside the server):

| Code                                                   | Meaning                                                | Mitigation                                 |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------ |
| `UNAUTHORIZED`                                         | Missing/invalid token, or insufficient role/permission | Re-authenticate or request proper access   |
| `WRONG_EMAIL_OR_PASSWORD`                              | Password mismatch during password login                | Prompt user to retry or initiate reset     |
| `VERIFIED_EMAIL_EXIST` / `VERIFIED_PHONE_NUMBER_EXIST` | Email/phone already verified on another account        | Ask for a different identifier             |
| `VALID_VERIFICATION_CODE_EXIST`                        | New OTP requested before cooldown                      | Display countdown timer                    |
| `EXPIRED_VERIFICATION_CODE`                            | OTP exceeded 10-minute validity                        | Trigger resend flow                        |
| `SOCIAL_ID_ALREADY_EXIST`                              | Social ID linked elsewhere                             | Ask user to unlink or use existing account |
| `USER_ALREADY_CONNECTED_TO_THIS_SOCIAL_PROVIDER`       | Provider already linked to user                        | Inform user link already active            |
| `NOT_PROVIDED_NOTIFICATION_TOKEN`                      | Attempted to enable notifications without token        | Collect device push token and retry        |
