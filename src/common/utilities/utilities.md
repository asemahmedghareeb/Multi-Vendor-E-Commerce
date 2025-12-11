# Utilities Reference

Utilities in this section provide reusable factories for GraphQL schema composition and request validation. Understanding them helps keep new modules consistent with the rest of the codebase.

## Quick Reference

| Utility                      | Location                                                | Purpose                                                                                                    |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `paginatedObjectTypeFactory` | `src/common/utilities/object-paginated-type.factory.ts` | Generates typed GraphQL connection wrappers with `items` and `pageInfo`.                                   |
| `ValidationPipeFactory`      | `src/config/validation-pipe/validation-pipe.factory.ts` | Produces a preconfigured Nest `ValidationPipe` that localises errors via `validationPipeExceptionFactory`. |

---

## `paginatedObjectTypeFactory`

```ts
export function paginatedObjectTypeFactory(TClass: {
  new (...args: any[]): any;
}) {
  @ObjectType({ isAbstract: true })
  class ResponseWrapper {
    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => [TClass], { nullable: true })
    items: (typeof TClass)[];
  }

  Object.defineProperty(ResponseWrapper, 'name', {
    value: `${TClass.name}Paginated`,
  });

  return ResponseWrapper;
}
```

### What it does

- Creates an abstract GraphQL `@ObjectType` that bundles a list of items and a `PageInfo` payload, ideal for cursor or page-based pagination.
- Dynamically renames the wrapper to `<EntityName>Paginated` so the GraphQL schema remains descriptive.
- Keeps pagination responses consistent across modules without manually duplicating boilerplate.

### Usage

```ts
const ArticlePaginated = paginatedObjectTypeFactory(Article);

@ObjectType()
export class ArticleConnection extends ArticlePaginated {}

@Query(() => ArticleConnection)
articles(@Args() args: NullablePaginatorArgsInput) {
	return this.articleService.list(args);
}
```

Recommendations:

- Extend the returned class (as shown above) when you need to add custom metadata fields.
- Always reuse the shared `PageInfo` type so front-end clients get the same pagination structure across queries.

## `ValidationPipeFactory`

Located in `src/config/validation-pipe/validation-pipe.factory.ts`, this factory centralises the configuration for Nest’s global validation pipe.

```ts
export const ValidationPipeFactory = (appHelperService: AppHelperService) =>
  new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) =>
      validationPipeExceptionFactory(errors, appHelperService),
  });
```

### Behaviour

- **`transform: true`** – Automatically converts incoming payloads into DTO instances, ensuring validators run against properly typed objects.
- **`enableImplicitConversion: true`** – Lets class-transformer coerce primitive strings to numbers/booleans when DTO metadata indicates a compatible type, reducing boilerplate in controllers.
- **`exceptionFactory`** – Delegates error formatting to `validationPipeExceptionFactory`, which in turn uses `AppHttpException` for consistent error codes and localisation (via the injected `AppHelperService`).

### Registration

Call the factory during bootstrap so every request passes through the configured pipe:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const helper = app.get(AppHelperService);
  app.useGlobalPipes(ValidationPipeFactory(helper));
  await app.listen(3000);
}
```

If a module needs a customised validation pipe (e.g., different conversion rules), you can instantiate `new ValidationPipe(...)` directly, but keep the global configuration aligned with this factory for consistency.

---

Update this document whenever you introduce new utilities or enhance the existing factories so developers have a central reference for shared infrastructure helpers.
