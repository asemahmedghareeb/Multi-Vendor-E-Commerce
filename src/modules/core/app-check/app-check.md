## App Check — developer guide (code-based)

What does this do

- Validates incoming Firebase App Check tokens on requests and GraphQL operations by consuming tokens via the Firebase Admin SDK (calls `appCheck().verifyToken(..., { consume: true })`).

Why and when to use App Check (based on current code)

- Purpose in code: the module enforces that an incoming request was issued by a client that passed Firebase App Check. The enforcement is implemented as a NestJS guard (`AppCheckGuard`) and a small service wrapper (`AppCheckService`) around the Firebase Admin SDK.
- When it runs: when a route or resolver is protected with the `RequireAppCheck()` decorator (which applies `AppCheckGuard`), the guard extracts the token from the request headers and calls `AppCheckService.validateToken` before allowing the request to proceed.

How to use (exact wiring and examples taken from current code)

1. Module wiring

- The module is global: `@Global()` on `AppCheckModule` and it provides/exports `AppCheckService`. Import path: `src/modules/core/app-check/app-check.module.ts`.

2. Apply to HTTP controllers or GraphQL resolvers

- HTTP controller example (current code pattern uses the decorator):

```ts
import { RequireAppCheck } from 'src/modules/core/app-check/decorator/app-check.decorator';

@Controller('example')
export class ExampleController {
  @Get()
  @RequireAppCheck()
  async get() {
    /* ... */
  }
}
```

- GraphQL resolver example (the project contains imports from the same decorator):

```ts
import { RequireAppCheck } from 'src/modules/core/app-check/decorator/app-check.decorator';

@Resolver()
export class ExampleResolver {
  @Query(() => String)
  @RequireAppCheck()
  exampleQuery() {
    /* ... */
  }
}
```

3. Token source and header name

- The guard reads the token from `request.headers['x-firebase-appcheck']` (lowercase header key used in code). The guard throws `AppHttpException(ErrorCodeEnum.FORBIDDEN)` with message `X-Firebase-AppCheck does not exist` when the header is missing.

4. Service API and behavior

- `AppCheckService` (file: `src/modules/core/app-check/services/app-check.service.ts`)
  - Constructor: on first instantiation it initializes `firebase-admin` with a certificate built from `ConfigService` keys: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
  - Method: `async validateToken(token: string)`
    - Calls `fireBaseAdmin.appCheck().verifyToken(token, { consume: true })` to verify and immediately consume the token.
    - If `claims.alreadyConsumed` is true the service throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'Already consumed FireBaseAppCheckToken' })`.
    - On verification errors the service throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'failed to validate X-Firebase-AppCheck' })` (unless the error is already an `AppHttpException`, which is rethrown).
    - On success the method returns the `claims` object returned by Firebase Admin SDK (the code returns whatever `verifyToken` returns).

5. Guard behavior (file: `src/modules/core/app-check/guards/app-check.guard.ts`)

- `AppCheckGuard` implements `CanActivate`.
- It supports both HTTP and GraphQL execution contexts: `getRequest` returns `context.switchToHttp().getRequest()` for HTTP, and `GqlExecutionContext.create(context).getContext().req` for GraphQL.
- The guard extracts `request.headers['x-firebase-appcheck']`. If missing it throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'X-Firebase-AppCheck does not exist' })`.
- The guard calls `await this.appCheckService.validateToken(token as string)` and, if that call resolves, returns `true` to allow the request to proceed.

Errors and exceptions (explicit messages produced by current code)

- Missing header: throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'X-Firebase-AppCheck does not exist' })` (from the guard).
- Failed verification: `AppCheckService.validateToken` throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'failed to validate X-Firebase-AppCheck' })` for verification errors returned by the Firebase SDK.
- Already consumed: `AppCheckService.validateToken` throws `AppHttpException(ErrorCodeEnum.FORBIDDEN, { message: 'Already consumed FireBaseAppCheckToken' })` when `claims.alreadyConsumed` is true.

Configuration keys used by the module

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Where to find the code

- Module: `src/modules/core/app-check/app-check.module.ts`
- Service: `src/modules/core/app-check/services/app-check.service.ts`
- Guard: `src/modules/core/app-check/guards/app-check.guard.ts`
- Decorator: `src/modules/core/app-check/decorator/app-check.decorator.ts`

Quick reference (summary)

- Header name read by guard: `x-firebase-appcheck` (from `request.headers['x-firebase-appcheck']`).
- How the token is checked: `fireBaseAdmin.appCheck().verifyToken(token, { consume: true })`.
- Guard decorator: `RequireAppCheck()` returns `UseGuards(AppCheckGuard)` (import path: `src/modules/core/app-check/decorator/app-check.decorator.ts`).
