# Interfaces Reference

This document describes the shared TypeScript interfaces under `src/common/interfaces`. Use it to understand the contract expected by infrastructure services.

## `AppDataloader<K, V>`

Defined in `dataloader.interface.ts`, this interface wraps a `dataloader` instance together with a helper accessor. It is used by the Dataloader registry to keep consistent typing when storing and retrieving loaders inside the GraphQL context.

```ts
export interface AppDataloader<K, V> {
  loader: Dataloader<K, V>;
  getDataloader(): Dataloader<K, V>;
}
```

### Usage Pattern

1. Implement the interface for each loader provider:

```ts
@Injectable()
@AppRequestScopedDataloader()
export class UserByIdLoader implements AppDataloader<string, User> {
  constructor(
    @InjectAppRepository(User) private readonly userRepo: AppRepository<User>,
  ) {}

  loader = new DataLoader<string, User>(async (ids) => {
    const users = await this.userRepo.findByIds(ids);
    return ids.map((id) => users.find((user) => user.id === id) ?? null);
  });

  getDataloader() {
    return this.loader;
  }
}
```

2. Register the loader in your GraphQL context builder so resolvers can fetch it by key:

```ts
const loaders = {
  userById: userByIdLoader.getDataloader(),
};

return { ...requestContext, loaders };
```

3. Inside resolvers, retrieve the loader from the context and call `.load(id)` or `.loadMany(ids)`.

### Why the Wrapper?

- Enforces a consistent API (`loader` property + `getDataloader()` method) regardless of how the Dataloader is constructed.
- Makes it easy to swap the implementation or decorate the returned loader (e.g., adding logging) without changing consuming modules.
- Plays nicely with dependency injection—providers can return the interface while hiding the underlying class.

When adding new interfaces, document them here so other teams understand the expected contracts and how they integrate with shared utilities.
