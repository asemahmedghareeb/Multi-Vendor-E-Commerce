# `AppHttpException` Reference

`AppHttpException` is the project-wide wrapper around NestJS’ `HttpException`. It standardizes how error codes and metadata are exposed to GraphQL/REST clients by coupling every thrown error to an entry in `ErrorCodeEnum` and optional extension payloads.

## Constructor Signature

```ts
new AppHttpException(
	errorCode: ErrorCodeEnum,
	extensions?: Record<string, string | number | Partial<ValidationError>[]>
)
```

- **`errorCode`** – Mandatory enum value describing the failure. The enum key becomes the error message and its numeric value becomes the HTTP status code returned to the client.
- **`extensions`** – Optional metadata merged into the GraphQL `extensions` field (or the JSON body for REST endpoints). Common keys include `message`, `field`, `validationErrors`, or any structured hints needed by the client.

Internally the constructor calls `super(ErrorCodeEnum[errorCode], errorCode)`, so every exception surfaces:

- `message`: the enum key (e.g., `USER_DOES_NOT_EXIST`).
- `status`: the numeric code (e.g., `1002`).
- `extensions`: whatever object was passed by the caller.

## When to Use

- Throw from services, guards, or resolvers whenever you want a consistent error payload.
- Prefer `AppHttpException` over manual `HttpException`/`BadRequestException` calls so error codes remain centralised in `ErrorCodeEnum`.
- Pair with the enum documentation to keep ranges intact (auth errors `1000–1299`, uploader `800–899`, etc.).

## Usage Examples

### Simple Domain Error

```ts
if (!user) {
  throw new AppHttpException(ErrorCodeEnum.USER_DOES_NOT_EXIST);
}
```

Client response (GraphQL):

```json
{
  "errors": [
    {
      "message": "USER_DOES_NOT_EXIST",
      "extensions": {
        "code": 1002
      }
    }
  ]
}
```

### Providing Additional Context

```ts
throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
  message: 'User does not have a password, oldPassword field should be empty.',
});
```

Downstream clients can surface the human-friendly `message` while still keying the toast/alert off the enum.

### Surfacing Validation Errors

Because the `extensions` object accepts `Partial<ValidationError>[]`, you can forward class-validator failures directly:

```ts
throw new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
  validationErrors: errors.map(({ property, constraints }) => ({
    property,
    constraints,
  })),
});
```

Front-ends can iterate `validationErrors` to annotate individual form fields.

## Best Practices

- **Stick to defined codes**: Add new error codes to `ErrorCodeEnum` before using them and document the semantic meaning.
- **Avoid leaking sensitive data**: Only include safe metadata in `extensions`; never pass raw stack traces or internal identifiers.
- **Localisation**: Let clients translate `message` keys or use `extensions.localisedMessage` when the server must supply translated strings.
- **Testing**: When writing unit tests around guarded behaviour, assert both the thrown enum and any required extension fields.

Use this exception consistently to keep error handling predictable across the entire platform.
