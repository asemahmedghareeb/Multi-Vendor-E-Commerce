# Exception Filters Reference

This file documents shared NestJS exception filters. At the moment the project exposes a single cross-cutting filter—`AppExceptionFilter`—responsible for turning thrown errors into localized HTTP/GraphQL responses.

## `AppExceptionFilter`

Located in `src/common/filters/exception.filter.ts`, this filter is registered globally so every exception thrown from resolvers, controllers, or middleware flows through the same handler.

### Responsibilities

- Convert thrown errors into a consistent structure powered by `AppHttpException` and `ErrorCodeEnum`.
- Localize error messages using `AppHelperService.localize` before sending them back to clients.
- Log unexpected (non `AppHttpException`) errors for observability.
- Support both HTTP (REST) and GraphQL execution contexts with tailored responses.

### GraphQL Flow

1. Any exception bubbles up to `catch()` with `ContextType` set to `'graphql'`.
2. Non-`AppHttpException` errors are wrapped in `AppHttpException(ErrorCodeEnum.SERVER_SIDE_ERROR)`.
3. The filter pulls the current `AppGqlContext`, extracts the request language (`ctx.lang`), and calls `appHelperService.localize('errors.<CODE>')`.
4. A `GraphQLError` is returned with:
   - `message`: localized string.
   - `extensions.code`: enum name derived from `ErrorCodeEnum[status]` (e.g., `UNAUTHORIZED`).
   - `extensions.status`: numeric HTTP status / error code.
   - `extensions.timestamp`: server timestamp.
   - Plus any custom metadata provided via `AppHttpException.extensions`.

Because GraphQL errors are returned in the data envelope, resolvers do not need to manually format responses—throwing `new AppHttpException(...)` is enough.

### HTTP (REST) Flow

1. The request/response objects are extracted from the `ArgumentsHost`.
2. The filter inspects the `lang` header to determine which translation to use (defaults to server language when absent or invalid).
3. The HTTP status is set via `response.status(exception.getStatus())`.
4. The JSON payload contains:
   ```json
   {
   	 "message": "<localized string>",
   	 "code": <status>,
   	 "extension": { ...exception.extensions }
   }
   ```

### Handling Unknown Errors

- `NotFoundException` is specifically wrapped to reuse `AppHttpException` and ensure a localized message.
- Any other unhandled native NestJS error is logged and converted into `AppHttpException(500)`.

### Registering the Filter

The filter is typically bound in the root `main.ts`:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appHelperService = app.get(AppHelperService);
  app.useGlobalFilters(new AppExceptionFilter(appHelperService));
  await app.listen(3000);
}
```

Ensure `AppHelperService` is available in the application context. If you add additional filters, keep their registration order in mind (`useGlobalFilters` executes in reverse order of registration).

### Adding Custom Metadata

When throwing `AppHttpException`, populate the `extensions` object to shape the response:

```ts
throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
  field: 'email',
  validationErrors: [
    { property: 'email', constraints: { isEmail: 'Invalid email' } },
  ],
});
```

The filter simply spreads `extensions` into the GraphQL payload and mirrors it under `extension` for HTTP clients.

### Extending the Filter

- To support additional transports (e.g., WebSockets), inspect `host.getType()` and provide a custom branch similar to the HTTP/GraphQL implementations.
- When introducing new localisation keys, update your translation files under `errors.<CODE>` to align with the messages generated here.

Keep this document updated if you introduce new filters or change the response contract so downstream teams know what to rely on.
