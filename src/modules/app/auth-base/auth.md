# Auth Base Documentation

## 1. Purpose and Scope

The `auth-base` package delivers every authentication, authorization, and identity-management capability in the application. It covers:

- Account registration and verification (password and social).
- Session lifecycle management with JWT-issued access and refresh tokens.
- Password resets and credential updates.
- Social account linking and login.
- Administrative RBAC built on groups and permissions.
- User profile maintenance and verification-code workflows.

This document targets both frontend and backend engineers. It explains how every GraphQL mutation and query is wired, why each component exists, and how data flows across the four submodules:

1. `admin-group`
2. `auth`
3. `session`
4. `social-auth`
5. `user`

Supporting infrastructure—guards, decorators, context providers, and helper services—is described where it influences behaviour or integration.

### 1.1 High-Level Architecture

GraphQL requests arrive at resolvers, which orchestrate the relevant services. Guards such as `AuthorizedGuard` and `RefreshSessionGuard` intercept those resolvers to enforce role, permission, and token policies before execution continues. Service-layer logic then reaches into the shared database through repositories, interacts with helper utilities (mail, SMS, social strategies), and delegates token work to `AppJwtService`. Request-scoped dataloaders sit alongside the resolvers to batch relational lookups and prevent N+1 access patterns.

### 1.2 GraphQL Execution Context

`GqlConfig` seeds the GraphQL context with the current `Session`, `User`, language, token, and `ModuleRef` for dependency lookups. The `ContextService`:

1. Extracts the bearer token and validates it through `AppJwtService.validateAccessToken`.
2. Loads the `Session` (with user relation) only if the token’s expiry matches `accessExpiryDate`.
3. Populates `AppGqlContext`, enabling decorators such as `@CurrentUser()` and `@CurrentSession()`.

When a client sends a GraphQL request with an access token, the gateway extracts the token and hands the HTTP request to `ContextService`. The service validates the token through `AppJwtService`, retrieves the corresponding session whose expiry matches the token payload, and loads the associated user in a single lookup. It then enriches the GraphQL context with the session, current user, preferred language, and a reference to `ModuleRef`, enabling downstream decorators and guards to operate with fully populated request metadata.

`AuthorizedGuard` subsequently checks:

- Role requirements (`AllowedRoles`).
- Permission sets (`@Auth` decorator metadata). Admin permissions resolve against the admin group associated with the user.
- Whether users flagged with `requireSettingPassword` are allowed to proceed.

## 2. Modules and Core Components

### 2.1 Admin Group Module

#### Entities

- `AdminGroup`: Administrator cohort with `name`, `description`, `scope`, and generated permission target.
- `AdminGroupPermission`: Join table linking groups to `Permission` records (enforces uniqueness on `(permissionId, adminGroupId)`).
- `Permission`: Unique `(target, action)` combination describing an ability, e.g., `AdminGroup.CREATE`.

#### Decorators

- `@GeneratePermissions()` (see `GeneratePermissions` decorator) attaches a static `permissionActionsEnum` getter to the decorated class. By default it exposes `DefaultPermissionActionsEnum` (`CREATE`, `READ`, `UPDATE`, `DELETE`). Passing a custom enum overrides the actions. `PermissionService.seedPermissions` inspects this metadata while bootstrapping permissions, so any entity or aggregate decorated with `@GeneratePermissions()` automatically contributes CRUD actions to the admin RBAC catalogue.

#### Services

- **`AdminGroupService`**
  - Seeds or updates the super admin group with every system permission.
  - Validates uniqueness of group names and permission IDs.
  - Performs CRUD on groups while protecting the super admin from modification or deletion.
  - Provides paginated retrieval for listings.
- **`PermissionService`**
  - Scans entity metadata and any `CustomPermissions` constants to seed or prune permission records.
  - Exposes paginated queries for application permissions.

#### Resolvers & Operations

- **Queries**
  - `adminGetAdminGroup(id: String!): AdminGroup` — reads a single group.
  - `adminGetAdminGroups(paginate?): AdminGroupPaginated` — lists groups with pagination.
  - `adminGetAppPermissions(paginate?): PermissionPaginated` — enumerates permissions (Permission target READ access required).
- **Mutations**
  - `adminCreateAdminGroup(input)`
    1. Validates name uniqueness.
    2. Verifies every `permissionsIds` entry exists.
    3. Creates the group and bulk-inserts `AdminGroupPermission` records.
    4. Returns `true`.
  - `adminUpdateAdminGroup(input)`
    1. Loads the group with current permissions.
    2. Rejects updates to the super-admin group.
    3. Validates name uniqueness if changed.
    4. Syncs permission assignments by diffing existing vs. new IDs.
    5. Updates scalar fields and returns `true`.
  - `adminDeleteAdminGroup(id)`
    1. Blocks super-admin deletion.
    2. Soft-deletes the group and returns `true`.

All admin mutations require:

- `@Auth` with `roles: [ADMIN]`.
- Permission actions targeting `AdminGroup.permissionsTarget` and corresponding `CREATE|UPDATE|DELETE|READ` actions.

#### Dataloader

`PermissionsByAdminGroupIdDataLoader` batches permission lookups when resolving the `permissions` field; it fetches `AdminGroupPermission` rows with eager `permission` relations.

### 2.2 Auth Module

#### Key Collaborators

- `AuthResolver` exposes `me`, `getUserLoginOptions`, and 17 mutations controlling registration, verification, login, password management, social linkage, and logout.
- `AuthService` orchestrates `UserService`, `SessionService`, `AppJwtService`, `UserVerificationCodeService`, and `SocialAuthService`.

#### Query Reference

- `me`: Returns the authenticated `User`. Requires a valid session and respects `allowUsersWithRequireSettingPassword`. Returns `AppHttpException.UNAUTHORIZED` if the guard rejects.
- `getUserLoginOptions(emailOrPhoneNumber)`:
  1.  Looks up a user with matching verified email or phone number.
  2.  Gathers available login strategies: password, email OTP, phone OTP, linked social providers.

#### Mutation Reference

| Mutation                                   | Purpose                                                               | Input Highlights                                                                                      | Response                                                 |
| ------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `registerUser`                             | Manual registration with optional password.                           | `ManualRegisterWithPasswordInput` (first/last names, email/phone, optional strong password, favLang). | Newly created `User` (unverified).                       |
| `socialRegisterUser`                       | Registration through a social provider.                               | `SocialRegisterUserInput` (provider token, optional contact info, optional `LoginDeviceInput`).       | `User` with optional JWT if `loginDeviceInput` provided. |
| `verifyUserEmail`                          | Confirms email with OTP.                                              | `VerifyUserInput` (userId, 4-digit code, optional `LoginDeviceInput`).                                | Updated `User`, optionally logged in.                    |
| `verifyUserPhoneNumber`                    | Confirms phone with OTP.                                              | `VerifyUserInput`.                                                                                    | Updated `User`, optionally logged in.                    |
| `loginUserWithPassword`                    | Authenticates via password.                                           | `LoginUserWithPasswordInput` (identifier + password + device info).                                   | `User` with `jwtAutToken`.                               |
| `loginUserWithEmailVerificationCode`       | Email OTP login.                                                      | `LoginUserWithEmailVerificationCodeInput`.                                                            | `User` with `jwtAutToken`.                               |
| `loginUserWithPhoneNumberVerificationCode` | SMS OTP login.                                                        | `LoginUserWithPhoneNumberVerificationCodeInput`.                                                      | `User` with `jwtAutToken`.                               |
| `loginUserWithSocialAccount`               | Valid social token login.                                             | `SocialLoginInput`.                                                                                   | `User` with `jwtAutToken`.                               |
| `resetUserPassword`                        | Completes password reset.                                             | `ResetUserPasswordInput` (identifier, OTP, new strong password).                                      | `true`.                                                  |
| `changeUserPassword`                       | Authenticated password change.                                        | `ChangeUserPasswordInput` (optional oldPassword, new strong password).                                | `true`.                                                  |
| `updateUserEmail`                          | Applies verified email update.                                        | `updateUserEmailOrPhoneNumberInput` (OTP). Requires `@Auth`.                                          | `true`.                                                  |
| `updateUserPhoneNumber`                    | Applies verified phone update.                                        | Same as above.                                                                                        | `true`.                                                  |
| `linkSocialAccount`                        | Adds a social provider to the profile.                                | `LinkSocialAccountInput`.                                                                             | `true`.                                                  |
| `unlinkSocialAccount`                      | Removes linked provider.                                              | `UnlinkUserSocialAccountInput`.                                                                       | `true`.                                                  |
| `registerSocialAccountForExistingUser`     | Converts existing verified account into social login enabled profile. | `RegisterSocialAccountForExistingUser`.                                                               | `User` with new `jwtAutToken`.                           |
| `logoutUser`                               | Invalidates current session.                                          | none (uses `@CurrentSession`).                                                                        | `true`.                                                  |

##### Mutation Flows

###### Manual Registration Flow

1. The client executes `registerUser` with the user’s profile, contact fields, preferred language, and optionally a password.
2. `AuthService` delegates to `UserService.verifyUserRegistrationEligibility`, which blocks the request if any verified account already owns the submitted email or phone number.
3. When eligible, `UserService.registerUser` persists the user, hashes the password when present, generates the user `code`, and leaves email/phone verification flags as `false`.
4. The resolver returns the unverified `User`. Clients typically follow up by requesting OTPs via `requestVerifyUserEmailVerificationCode` or `requestVerifyUserPhoneNumberVerificationCode` (self-serve flows use the login OTP mutations).

###### Manual Login Flow

1. Users submit `loginUserWithPassword`, passing their identifier and a `LoginDeviceInput` payload.
2. `AuthService.validateUserWithVerifiedEmailOrPhoneNumberExist` confirms the identifier maps to a verified user and loads their stored password hash.
3. Password comparison occurs with `bcrypt.compare`. A mismatch raises `WRONG_EMAIL_OR_PASSWORD`.
4. On success, `SessionService.startSession` records device metadata, enforces notification-token uniqueness, and computes access/refresh expiries.
5. `AppJwtService.generateAppJwtToken` produces the token bundle attached to the returned `User` in `jwtAutToken`.

###### Social Registration Flow

1. Clients call `socialRegisterUser` with an identity token and provider enum. Optional profile data is reconciled against the provider payload.
2. Email in the input is intentionally nullable: most providers (e.g., Google) already supply a verified email. Supplying a different manual email alongside a provider email raises `EMAIL_PROVIDED_BOTH_MANUALLY_AND_BY_SOCIAL_PROVIDE`. Clients should only send `input.email` when the social provider does **not** return one (some Facebook scopes or phone-only providers).
3. `SocialAuthService.validateLinkingSocialAccountEligibility` verifies the token with the provider strategy, prevents existing social IDs from being reused, and ensures email parity when supplied.
4. `UserService.registerUser` (via `AuthService`) creates or updates the user record, marks email as verified if the provider guarantees it, and links the new `SocialAccount` entity.
5. If `loginDeviceInput` is provided, `SessionService.startSession` issues an immediate session so the response includes an `AppJwtToken` bundle.

###### Social Login Flow

1. The `loginUserWithSocialAccount` mutation receives the provider token plus `LoginDeviceInput`.
2. `SocialAuthService` validates the token, loads the existing `SocialAccount`, and ensures the underlying user still meets login requirements (verified contact, not blocked).
3. `SessionService.startSession` and `AppJwtService.generateAppJwtToken` run as in manual login, returning the authenticated `User` with tokens.
4. For users who registered manually first, `registerSocialAccountForExistingUser` allows upgrading to social login. It validates the token matches the user’s verified email/phone, links the social provider, and issues a fresh token bundle using the supplied device metadata.

###### Verification Flows

- **Initial verification**: `requestVerifyUserEmailVerificationCode` / `requestVerifyUserPhoneNumberVerificationCode` (admin-assisted) or the self-serve login variants create OTPs through `UserVerificationCodeService.createVerificationCode`, enforcing a 2-minute throttle and 10-minute expiry.
- **Ownership confirmation**: `verifyUserEmail` / `verifyUserPhoneNumber` validate the OTP, clear conflicting contact data on other users, mark the requesting user as verified, and optionally start a session when `loginDeviceInput` is present.
- **Contact updates**: `requestUpdateUserEmailVerificationCode` / `requestUpdateUserPhoneNumberVerificationCode` send OTPs for new contact info. The corresponding `updateUserEmail` / `updateUserPhoneNumber` mutations consume those codes and apply the change atomically.
- **Password recovery**: `requestResetUserPasswordVerificationCode` selects the delivery channel and issues the OTP; `resetUserPassword` consumes it and sets the new credential. Authenticated users can change their password via `changeUserPassword`, which still enforces strong-password validation and (when applicable) the old-password check.

### 2.3 Session Module

#### Entity

- `Session`: Tracks device metadata, notification token, language preference, and expiry timestamps. `expired` getter compares refresh expiry to current time.

#### Service Highlights (`SessionService`)

- `startSession(User, LoginDeviceInput)`
  - Validates notification token uniqueness (removes expired duplicates; rejects active duplicates).
  - Calculates expiry using `AppJwtConfig` (15-minute access, 7-day refresh by default).
  - Persists the session and returns it.
- `refreshSession(Session)` updates expiry windows and returns the mutated session.
- `updateSession(Session, UpdateSessionInput)` toggles notification settings and language; ensures a token exists if notifications are being enabled.

#### Resolver Operations

- `currentSession`: Returns the active session or raises `UNAUTHORIZED`.
- `refreshToken`: Guarded by `RefreshSessionGuard`; yields a fresh `AppJwtToken` when the provided refresh token is valid.
- `updateCurrentSession`: Authenticated mutation that forward to `SessionService.updateSession`.
- `Session.user` resolve field uses `UserDataloader` to batch user lookups.

#### Refresh Session Guard

- Validates the bearer token as a refresh token (`TokenType.REFRESH_TOKEN`).
- Confirms the session’s `refreshExpiryDate` matches the provided `exp` to prevent replay.
- Injects the session into `AppGqlContext` for downstream access.

#### Maintenance Cron

- `SessionCron.removeExpiredSessions` (scheduled at 04:00 daily) purges expired refresh sessions when `AppConfig.monitorUserActivity` is `false`.

### 2.4 Social Auth Module

- `SocialAccount` entity enforces uniqueness on `(socialProvider, socialId)` and tracks the owning `User`.
- `SocialAuthService`:
  - Validates tokens via strategy classes.
  - Prevents linking duplicate social IDs across users.
  - Provides login validation that ensures the linked account is verified.
  - Exposes connected provider lists for unlink safeguards.
- `SocialProviderService` resolves strategy implementations with `ModuleRef` and normalizes exceptions to `INVALID_SOCIAL_AUTH_TOKEN`.
- Strategies:
  - **Google**: Verifies ID tokens using `google-auth-library` and the configured `GOOGLE_CLIENT_ID`.
  - **Facebook**: Validates tokens through Facebook’s debug API, then fetches user data.
- `SocialAuthResolver` currently serves as an anchor for future queries/mutations (no public operations today).

### 2.5 User Module

#### Entities and Relationships

- `User`: Core account with verification flags, role, optional admin group, sessions, social accounts, and verification-code relations.
- `UserVerificationCode`: Stores OTP metadata per use case (update email/phone, login, reset, verification). Enforces single active code per user via service logic.

#### Services

- `UserService`
  - Validation helpers (existence checks, uniqueness enforcement, verified contact presence).
  - Registration for end users and administrators.
  - Password hashing via `AuthHelperService`.
  - Generation of verification codes through `UserVerificationCodeService` (mail/SMS dispatch delegated by resolvers).
  - Admin user creation enforces group existence and blocks multiple super admins.
- `UserVerificationCodeService`
  - Generates 4-digit codes (valid 10 minutes) with 2-minute throttle per user.
  - Consumes codes atomically, enforcing expiry.

#### Resolvers & Mutations

- `UserResolver`
  - `updateUserInfo`: Authenticated mutation allowing name or language updates.
  - `adminCreateAdmin`: Restricted to admins with `REGISTER_ADMIN` permission; delegates to `UserService.createAdminUser`.
- `UserVerificationCodeResolver`
  - `requestVerifyUserEmailVerificationCode`
    - Validates user exists and isn’t already verified.
    - Sends templated email via `MailService` with OTP.
  - `requestVerifyUserPhoneNumberVerificationCode`
    - Sends SMS with OTP if phone pending verification.
  - `requestLoginUserVerificationCodeWithEmail`
    - Requires verified email; ships email OTP.
  - `requestLoginUserVerificationCodeWithPhoneNumber`
    - Requires verified phone; ships SMS OTP.
  - `requestUpdateUserEmailVerificationCode`
    - Authenticated; blocks super-admin email change.
    - Ensures new email is unused; sends OTP to new email.
  - `requestUpdateUserPhoneNumberVerificationCode`
    - Authenticated; ensures new phone is unused; sends SMS OTP.
  - `requestResetUserPasswordVerificationCode`
    - Accepts identifier and optional strategy.
    - Validates verified contact for requested channel and dispatches mail or SMS accordingly.

Each resolver uses transactional boundaries (`@Transactional()`) to maintain consistency when sending messages and creating codes.

## 3. Authentication & Authorization Flow Summary

### 3.1 Session + JWT Lifecycle

1. **Token issuance (login/register)**

- After a successful login or verification that requests a session, `SessionService.startSession` persists device metadata, calculates `accessExpiryDate` (15 minutes) and `refreshExpiryDate` (7 days), and returns an `AppJwtToken` bundle containing both tokens plus their expiries. The client must store the pair.

2. **Supplying tokens on requests**

- Standard authenticated queries and mutations must include the access token in the `Authorization` header using the Bearer scheme:
  - `Authorization: Bearer <accessToken>`
- `ContextService.getToken` extracts this header, `AppJwtService.validateAccessToken` ensures the token is an access token, and the matching session is loaded into the GraphQL context. Guards (`@Auth`) then rely on `currentUser` and `session` populated by this step.

3. **Refreshing tokens**

- When the access token is about to expire or has expired, the client calls the `refreshToken` mutation and **must swap the header to carry the refresh token**:
  - `Authorization: Bearer <refreshToken>`
- Because refresh tokens are not access tokens, the request arrives without an attached session in context. `RefreshSessionGuard` activates on the mutation, validates the bearer token via `AppJwtService.validateRefreshToken`, fetches the persisted session whose `refreshExpiryDate` matches the token, and injects that session into the context before resolver execution.
- `SessionService.refreshSession` then rolls both expiry timestamps forward and `AppJwtService.generateAppJwtToken` issues a fresh token pair. Clients should overwrite their stored tokens with the new values immediately.

4. **Using refreshed credentials**

- Subsequent API calls revert to sending the new access token in the Authorization header. The refresh token returned in step 3 replaces the old one and remains valid until its new expiry.

5. **Logout**

- The `logoutUser` mutation (access-token protected) removes the active session from the repository. Both existing tokens become unusable because future validations will fail to locate the deleted session.

### 3.2 Verification Code Workflow

Every verification flow follows two phases. First, the client raises one of the `request…VerificationCode` mutations. The resolver delegates to `UserService`, which checks the targeted user and use-case requirements before asking `UserVerificationCodeService` to mint a four-digit code. Once generated, the resolver triggers either the mail or SMS provider with the templated payload and returns immediately to the client. Second, the client submits the received code to the appropriate mutation (`verifyUserEmail`, `resetUserPassword`, and so on). That mutation validates and consumes the code via `UserVerificationCodeService`, applies the intended side effects—such as marking a contact as verified, updating credentials, or starting a session—and finally replies with the resulting entity or success flag.

### 3.3 Permission Enforcement

- `PermissionService.seedPermissions` scans every entity decorated with `@GeneratePermissions()` to populate CRUD actions.
- When an admin is authenticated, `AuthorizedGuard` loads their group’s permissions via `GuardHelperService`. Operations requiring specific actions compare compound keys `target.action`.
- Super admin group maintenance ensures newly generated permissions are always granted to the super admin.

### 3.4 Registration Flow End-to-End

1. **Account creation request**

- Public clients invoke `registerUser` with first/last name, email and/or phone number, language preference, and optionally a password. Admins can create staff accounts through `adminCreateAdmin`, which delegates to the same service but enforces an admin group and flags `requireSettingPassword` when no password is supplied.
- Social sign-up uses `socialRegisterUser`, which first validates the provider token, harmonises profile data, and then reuses `UserService.registerUser` while marking the email as verified only if the provider supplied it.

2. **Eligibility checks and persistence**

- `UserService.verifyUserRegistrationEligibility` ensures no verified email or phone conflict exists. For admin creation, the service validates the target admin group and prevents duplicating the super admin role.
- On success, the user record is stored with verification flags set to false, a generated `code`, and (if provided) a hashed password. Social registrations immediately link the social account to the new user.

3. **Requesting verification codes**

- Email verification: `requestVerifyUserEmailVerificationCode` (admin/back-office) or `requestLoginUserVerificationCodeWithEmail` (self-service) issue OTPs via the mail module.
- Phone verification: `requestVerifyUserPhoneNumberVerificationCode` or its login counterpart send SMS OTPs through the SMS module.
- Each request funnels through `UserVerificationCodeService.createVerificationCode`, which enforces a two-minute throttle and ten-minute expiry, storing contextual metadata (e.g., new email/phone for updates).

4. **Consuming verification codes**

- Users confirm ownership with `verifyUserEmail` or `verifyUserPhoneNumber`. The resolver consumes the code, clears conflicting emails or phone numbers on other accounts, and flips the relevant verification flag. If `loginDeviceInput` accompanies the verification, `SessionService.startSession` immediately issues tokens so the user lands in an authenticated state.

5. **Setting passwords and enabling login strategies**

- Manual registrants without an initial password call `changeUserPassword` after verification; admins that were flagged with `requireSettingPassword` must do so before most guarded actions.
- `getUserLoginOptions` reflects the current state, indicating whether password, email OTP, phone OTP, or linked social providers are available.

6. **Ongoing authentication**

- Once verified and optionally linked to social providers, users authenticate via `loginUserWithPassword`, `loginUserWithEmailVerificationCode`, `loginUserWithPhoneNumberVerificationCode`, or `loginUserWithSocialAccount`. Each path ultimately issues tokens through `SessionService.startSession`, feeding into the session and refresh lifecycle described earlier.

This sequence ensures that registration, verification, and session provisioning are fully coordinated across services, repositories, and notification channels, regardless of whether the origin was manual, social, or administrator initiated.

## 4. Field and Input Reference

### 4.1 Common Inputs

- `LoginDeviceInput`: Required for login mutations; contains device name, optional notification token, allowNotifications flag, device type (`DeviceEnum`), and language preference.
- `ManualRegisterWithPasswordInput`: Extends `RegisterUserInput` with optional strong password (if omitted, user must set later).
- `SocialRegisterUserInput`: Partial register input plus provider token and optional device info.
- `ChangeUserPasswordInput`: Ensures new password meets `IsStrongPassword`; `oldPassword` is mandatory when a stored password exists.
- `ResetUserPasswordInput`: Accepts OTP and new password for reset flow.

### 4.2 Entities with Generated Permissions

- `User`, `AdminGroup`, `Permission`, and `SocialAccount` leverage `@GeneratePermissions()` to auto-register CRUD actions.
- These appear in `PermissionService.seedPermissions` and can be assigned to admin groups.

## 5. Developer Checklists

### 5.1 When Adding New Auth Mutations

1. Decide which guard metadata (`@Auth`) is required.
2. Reuse `UserService` validation helpers instead of duplicating queries.
3. Use `UserVerificationCodeService` to create/consume OTPs for any new verification use cases.
4. Update `PermissionService` or `CustomPermissions` if a new permission target/action is introduced.

### 5.2 Client Integration Notes

- **Token Handling:** Persist both tokens; refresh by calling `refreshToken` before `refreshExpiryDate` lapses. On logout, discard both tokens.
- **OTP Forms:** All codes are exactly four digits (`IsNumberString`, `MinLength(4)`, `MaxLength(4)`). Enforce numeric-only input on the client.
- **Notification Tokens:** Required when enabling push notifications (`allowNotifications = true`). Attempting to enable without a token returns `NOT_PROVIDED_NOTIFICATION_TOKEN`.
- **Language Headers:** Clients should send `lang` header (`en` or `ar`) so templated notifications localize correctly.

## 6. Appendix: Error Code Highlights

- `UNAUTHORIZED`: Missing/invalid session, insufficient role/permission, or absent refresh token.
- `WRONG_EMAIL_OR_PASSWORD`: Password mismatch during login.
- `VERIFIED_EMAIL_EXIST` / `VERIFIED_PHONE_NUMBER_EXIST`: Attempting to register or update with contact info already verified on another account.
- `VALID_VERIFICATION_CODE_EXIST`: Re-requesting an OTP before the two-minute cooldown.
- `EXPIRED_VERIFICATION_CODE`: OTP exceeded ten-minute validity window.
- `SOCIAL_ID_ALREADY_EXIST`: Social ID already linked to another user.
- `USER_ALREADY_CONNECTED_TO_THIS_SOCIAL_PROVIDER`: Attempting to relink an existing provider for the same user.
- `NOT_PROVIDED_NOTIFICATION_TOKEN`: Notification token required but missing when enabling notifications.

---

This documentation reflects the current behavior of the `auth-base` modules and their interactions. Use it as the authoritative guide when extending authentication flows, integrating frontend clients, or managing administrative features.
