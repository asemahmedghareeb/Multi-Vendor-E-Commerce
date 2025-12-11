# Interceptors Reference

Interceptors sit between NestJS handlers and the response stream, letting us transform payloads, attach metadata, or add logging. This document covers the shared interceptors in `src/common/interceptors`. Currently the codebase ships a single interceptor scaffold—`ResponseSerializerInterceptor`—intended to unify API responses once custom serialization is added.

## `ResponseSerializerInterceptor`

Located at `response-serializer.interceptor.ts`, this interceptor implements `NestInterceptor<T>` and hooks into the RxJS pipeline returned by handlers.

### Current Behavior

- Invokes `next.handle()` and passes the response through unchanged using `map(res => res)`.
- Annotated with TODOs to add logging and subscription support in the future. Treat it as a foundation: you can extend it to shape responses, redact fields, or wrap data envelopes consistently across modules.

### Typical Registration

Register the interceptor globally in `main.ts` so every REST/GraphQL handler benefits from consistent response formatting:

```ts
import { ResponseSerializerInterceptor } from 'src/common/interceptors/response-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseSerializerInterceptor());
  await app.listen(3000);
}
```

You can also scope it to a module or resolver/controller using `@UseInterceptors(ResponseSerializerInterceptor)` when you need localized behaviour.

### Extending the Interceptor

Common customisations when you revisit this file:

- **Response envelopes** – Wrap raw resolver output in a consistent `{ data, meta }` shape.
- **Logging** – Leverage the TODO to inject a logger and record payload sizes or execution durations (`tap()` operator pairs well with `map()`).
- **Streaming/Subscribers** – Add the subscription support mentioned in the TODO if you plan to return `Observable` streams from handlers.
- **Serialization rules** – Integrate class-transformer to strip internal fields, e.g., `map((res) => plainToInstance(dto, res, { excludeExtraneousValues: true }))`.

When introducing breaking changes to the outbound format, coordinate with client teams and update the relevant API documentation.

---

Update this document whenever you add new interceptors or evolve `ResponseSerializerInterceptor` so developers know where cross-cutting transformations occur.
