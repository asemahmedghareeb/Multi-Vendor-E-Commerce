# Guards Reference

Nest guards encapsulate authentication and rate-limiting rules across the application. This document explains the shared guards living in `src/common/guards` so you can reuse or extend them safely.

## Quick Reference

| Guard               | Purpose                                                                                                                                   | Applies To                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `AuthorizedGuard`   | Ensures the request has an authenticated user, checks `requireSettingPassword`, evaluates role metadata, and validates permission tuples. | GraphQL resolvers (and any handler using the GraphQL context). |
| `AppThrottlerGuard` | Extends Nest’s `ThrottlerGuard` with GraphQL support and consistent error responses.                                                      | HTTP + GraphQL endpoints bound to the throttler.               |

---

## `AuthorizedGuard`

`authorized.guard.ts` implements `CanActivate` and is designed primarily for GraphQL resolvers. It depends on three decorators (`@AllowedRoles`, `@RequiredPermissions`, and `@AllowUsersWithRequireSettingPassword`) to read metadata through Nest’s `Reflector`.

### Execution Flow

1. Pull metadata for roles, permissions, and the `allowUsersWithRequireSettingPassword` override.
2. Extract the `AppGqlContext` via `GqlExecutionContext.create()`. The guard expects `AppGqlContext.currentUser` to be populated by upstream middleware (e.g., JWT auth).
3. Throw `AppHttpException(ErrorCodeEnum.UNAUTHORIZED)` when:
   - No user is present in context.
   - The user must set a password (`requireSettingPassword = true`) and the handler did not opt-in to allow them.
   - The user’s role is not included in the metadata.
4. For admin users (`UserRoleEnum.ADMIN`), pass the request to `GuardHelperService.validateUserHasPermission` when permission metadata exists. The helper is expected to throw using the provided exception otherwise.

### Usage Patterns

- **GraphQL resolvers**: Prefer the composite decorator `@Auth()` which already wires `AuthorizedGuard` plus metadata.

```ts
@Auth({
	roles: [UserRoleEnum.ADMIN],
	permissions: [
		{ target: PermissionTargetEnum.USER, action: DefaultPermissionActionsEnum.UPDATE },
	],
})
@Mutation(() => Boolean)
archiveUser(@Args('userId') userId: string) {
	return this.userService.archive(userId);
}
```

- **Manual guard usage**: When you need to customize guard order or combine with additional guards, use `@UseGuards(AuthorizedGuard)` and add the metadata decorators separately.

```ts
@UseGuards(AuthorizedGuard)
@AllowedRoles(UserRoleEnum.ADMIN)
@RequiredPermissions({ target: PermissionTargetEnum.SESSION, action: DefaultPermissionActionsEnum.READ })
@Query(() => [Session])
sessions(@Args() args: ListSessionsArgs) { ... }
```

### Extending the Guard

- Support for REST controllers would require injecting the HTTP request into `AppGqlContext` or adding a branch for `context.getType() === 'http'`. As written, it assumes a GraphQL pipeline.
- When introducing new metadata decorators, update the guard to read them via `reflector.getAllAndOverride` and adjust the logic accordingly.

## `AppThrottlerGuard`

Wrapper around Nest’s `ThrottlerGuard` to unify rate-limiting errors between HTTP and GraphQL transports. Also, it automatically bypasses throttling for GraphQL subscriptions.

### Key Customisations

1. **`canActivate` override**: Checks if the context is GraphQL and if the operation is a subscription. If so, throttling is skipped and the request is always allowed. Otherwise, it delegates to the base throttler logic.
   - This ensures subscriptions are never rate-limited.
2. **`getRequestResponse` override**: Detects whether the guard is running in an HTTP context or GraphQL resolver.
   - HTTP requests use `context.switchToHttp()`.
   - GraphQL requests rely on `GqlExecutionContext.create(context)` and read `ctx.getContext().req`/`res` (the same objects that Nest attaches to GraphQL context).
3. **`throwThrottlingException` override**: Instead of using the default `ThrottlerException`, it throws `AppHttpException(ErrorCodeEnum.TOO_MANY_REQUESTS)` so the global exception filter can localize and structure the response.

### Registration

Add the guard globally in `main.ts` alongside Nest’s `ThrottlerModule`:

```ts
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from 'src/common/guards/app-throttler.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(app.get(AppThrottlerGuard));
  await app.listen(3000);
}
```

Alternatively, register per-module or per-route with `@UseGuards(AppThrottlerGuard)` when you need targeted rate limiting.

#### Notes

- GraphQL subscriptions are **never throttled** by this guard. All other operations (queries, mutations, HTTP requests) are subject to rate limiting as configured.

### Configuration Tips

- Combine with `ThrottlerModule.forRoot({ ttl, limit })` to set default rate windows. The guard reads the limit details via the base class.
- Because the guard returns `AppHttpException`, GraphQL clients receive the same error shape defined in the exception filter (`extensions.code`, `extensions.status`, etc.).
- If you need different limits per resolver, use `@Throttle(limit, ttl)` decorator from `@nestjs/throttler`; the guard respects those metadata values.

---

Keep this reference updated as you introduce new guards or expand the existing ones to additional transports.
