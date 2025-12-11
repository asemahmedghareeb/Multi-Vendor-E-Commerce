# Common Decorators Reference

This guide explains the reusable decorators defined in `src/common/decorators`. They augment NestJS controllers, providers, and GraphQL resolvers across the application. Each section below covers the decorator’s intent, configuration options, and example usage so you can wire them into new features confidently.

## Quick Reference

| Decorator                                     | Target                      | Purpose                                                                                                               |
| --------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Auth(options?)`                              | Resolver/Controller handler | Wraps the `AuthorizedGuard` and optionally attaches role/permission requirements and the “require password” override. |
| `AllowedRoles(...roles)`                      | Handler                     | Adds allowed `UserRoleEnum` values to metadata consumed by `AuthorizedGuard`.                                         |
| `RequiredPermissions(...permissions)`         | Handler                     | Declares fine-grained permission tuples checked by `AuthorizedGuard`.                                                 |
| `AllowUsersWithRequireSettingPassword(allow)` | Handler                     | Overrides the default block on users flagged with `requireSettingPassword`.                                           |
| `CurrentUser()`                               | Resolver parameter          | Injects the authenticated `User` entity into GraphQL handlers.                                                        |
| `CurrentSession()`                            | Resolver parameter          | Injects the active `Session` model related to the access token.                                                       |
| `AppRequestScopedDataloader()`                | Class                       | Marks Dataloader providers as request-scoped so each GraphQL request gets isolated caches.                            |
| `InjectAppRepository(Entity)`                 | Constructor parameter       | Injects the app-specific repository token for a TypeORM entity.                                                       |
| `GeneratePermissions(Enum?)`                  | Class                       | Exposes a static `permissionActionsEnum` getter used when seeding permission matrices.                                |

---

## `Auth(options?: AuthOptions)`

Composite decorator that wraps the controller/resolver handler with the `AuthorizedGuard` and attaches metadata describing who can access the handler.

```ts
@Auth({
	roles: [UserRoleEnum.ADMIN],
	permissions: [
		{ target: PermissionTargetEnum.SESSION, action: DefaultPermissionActionsEnum.READ },
	],
	allowUsersWithRequireSettingPassword: false,
})
@Mutation(() => AdminSessionResponse)
updateSession(...)
```

**Options**

- `roles?: UserRoleEnum[]` – If provided, only users matching one of these roles proceed. Under the hood this is equivalent to calling `AllowedRoles`.
- `permissions?: PermissionOptions[]` – Array of permission tuples (`target`, `action`, `scope?`) enforced by `AuthorizedGuard`. Mirrors `RequiredPermissions`.
- `allowUsersWithRequireSettingPassword?: boolean` – When `true`, skips the default guard check that blocks logins flagged with `requireSettingPassword`.

Because `Auth` already binds the guard, you rarely need to use `AllowedRoles`, `RequiredPermissions`, or `AllowUsersWithRequireSettingPassword` separately unless you are composing custom decorator stacks.

## `AllowedRoles(...roles: UserRoleEnum[])`

Attaches allowed roles metadata (`roles`) to the handler. The `AuthorizedGuard` reads this metadata to enforce coarse-grained access control.

Use this when you need to require specific roles but don’t want to opt into the full `Auth` composite decorator (for example, when applying guards at the controller level yourself).

```ts
@UseGuards(AuthorizedGuard)
@AllowedRoles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
@Query(() => [User])
listUsers() { /* ... */ }
```

## `RequiredPermissions(...permissions: PermissionOptions[])`

Declares fine-grained permission requirements. Each item is an object `{ target, action, scope? }` defined in `allowed-permission.type.ts`. The `AuthorizedGuard` ensures the current user has every listed permission before allowing execution.

This decorator is commonly combined with `AllowedRoles` (or bundled through `Auth`).

```ts
@Auth({
	permissions: [
		{ target: PermissionTargetEnum.USER, action: DefaultPermissionActionsEnum.UPDATE },
		{ target: PermissionTargetEnum.USER, action: DefaultPermissionActionsEnum.READ },
	],
})
@Mutation(() => Boolean)
updateUser(...) {
	return this.userService.update(...);
}
```

## `AllowUsersWithRequireSettingPassword(allow: boolean)`

By default the guard blocks users whose profile sets `requireSettingPassword = true`. Applying this decorator with `true` allows those users to execute the handler anyway—useful for operations that help them set or confirm their password.

```ts
@Auth({ allowUsersWithRequireSettingPassword: true })
@Mutation(() => Boolean)
completeFirstLogin(...) { /* ... */ }
```

If you prefer to manage guard composition manually:

```ts
@UseGuards(AuthorizedGuard)
@AllowUsersWithRequireSettingPassword(true)
resetTemporaryPassword(...) { /* ... */ }
```

## `CurrentUser()`

GraphQL parameter decorator that injects the authenticated `User` entity pulled from the `AppGqlContext`. Returns `undefined` when the guard did not attach a user (e.g., unauthenticated requests).

```ts
@Auth()
@Mutation(() => Boolean)
updateProfile(@CurrentUser() user: User, @Args('input') input: UpdateUserInput) {
	return this.profileService.update(user.id, input);
}
```

The decorator is resolver-only (it relies on `GqlExecutionContext`). For REST controllers you should continue using standard Nest pipes or custom middleware.

## `CurrentSession()`

Similar to `CurrentUser`, but returns the active `Session` entity created when the user logged in. The value comes from the same GraphQL context (`AppGqlContext.session`). Handlers that need to mutate the session (e.g., to update notification tokens) should rely on this decorator.

```ts
@Auth()
@Mutation(() => Boolean)
updateCurrentSession(@CurrentSession() session: Session, @Args('input') input: UpdateSessionInput) {
	return this.sessionService.update(session, input);
}
```

If the session is missing (user logged out or token invalid) the guard rejects the request before your resolver runs.

## `AppRequestScopedDataloader()`

Class decorator that wraps a Dataloader provider with `@Injectable({ scope: Scope.REQUEST })`. Apply it to any Dataloader so each GraphQL request gets its own instance, preventing cross-request caching leaks.

```ts
@AppRequestScopedDataloader()
export class UserByIdLoader extends DataLoader<string, User>(async (ids) => {
	const users = await this.userRepository.findByIds(ids);
	// map results back to the requested order
	return ids.map((id) => users.find((user) => user.id === id) ?? null);
});
```

Pair this with the `AppRequestScopedDataloader` factory/builder that registers loaders inside the GraphQL context so resolvers can pull them via your Dataloader registry service.

## `InjectAppRepository(Entity)`

Parameter decorator that resolves a repository token named `<EntityName>Repository`. This allows modules to inject repositories that extend the custom `AppRepository` wrapper registered elsewhere in the application.

```ts
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';

@Injectable()
export class ArticleService {
  constructor(
    @InjectAppRepository(Article)
    private readonly articleRepository: AppRepository<Article>,
  ) {}
  // ...
}
```

Ensure the corresponding provider is bound in the module (usually through the core database module) to avoid runtime injection errors.

## `GeneratePermissions(permissionEnum?: PermissionEnumType)`

Class decorator used on modules that need an associated permission action enum when seeding permissions. It defines a static getter `permissionActionsEnum` on the decorated class returning either the provided enum or the default `DefaultPermissionActionsEnum`.

```ts
@GeneratePermissions(ArticlePermissionActionsEnum)
@Module({
	providers: [...],
})
export class ArticleModule {}
```

Code that seeds or inspects permissions can then access `ModuleClass.permissionActionsEnum` to determine which action set belongs to the module. Use the optional `permissionEnum` argument when a module defines a custom action enum; omit it to fall back to the default CRUD-style actions.

---

### Tips for Composing Decorators

- When protecting GraphQL resolvers, prefer `@Auth()` for consistency. Layer additional `AllowedRoles` or `RequiredPermissions` only when you need to override metadata dynamically.
- Param decorators (`CurrentUser`, `CurrentSession`) assume requests passed through the `AuthorizedGuard`. They return `undefined` if called on unauthenticated resolvers.
- Apply `AppRequestScopedDataloader` to every Dataloader class to avoid shared caches between concurrent users.
- Repository injection relies on consistent token naming; always suffix your provider with `Repository` when registering custom repositories.

Use this document as the canonical reference whenever you add new resolvers or services that hook into the shared infrastructure.
