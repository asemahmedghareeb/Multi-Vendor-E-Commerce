## Context module — code explanation

This file documents the current code in `src/modules/core/context`.

Files and responsibilities

- `context.module.ts`
  - Imports `SessionModule` and `AppDatabaseModule.forFeature([Session])`.
  - Provides and exports `ContextService`.

- `context.service.ts`
  - Injectable `ContextService` with dependencies:
    - `AppJwtService` (injected as `appJwtService`).
    - `@InjectAppRepository(Session) userSessionRepository` (injected as `sessionRepository` of type `AppRepository<Session>`).

ContextService methods

- `getLang(req: Request): LangEnum`
  - Reads `req.headers.lang` as a string.
  - If `lang` is missing or not one of the values in `LangEnum`, sets `lang = AppConfig.defaultLang`.
  - Returns `LangEnum.EN` when `lang === 'en'`, otherwise returns `LangEnum.AR`.

- `getToken(req: Request)`
  - Reads `authorization` header from `req.headers`.
  - If the header is missing or does not start with `'Bearer '`, returns `undefined`.
  - Otherwise returns the token substring after `'Bearer '`.

- `async getSession(req: Request)`
  - Calls `this.getToken(req)` to retrieve the access token. If no token is present, returns `undefined`.
  - Calls `this.appJwtService.validateAccessToken(accessToken)` and stores the result in `payload`. If `payload` is falsy, returns `undefined`.
  - Extracts `sessionId` from `payload` and calls `this.sessionRepository.findOne` with:
    - `where: { id: sessionId, accessExpiryDate: new Date(payload.exp * 1000) }`
    - `relations: { user: true }`
  - Returns the found `Session` entity or `undefined`.

Types and imports referenced

- `Request` from `express` is used as the method parameter type.
- `LangEnum` from `src/common/enums/lang.enum` is used in `getLang` return type and validation.
- `AppConfig` from `src/config/app.config` provides `defaultLang` used as a fallback.
- `AppJwtService` provides `validateAccessToken(accessToken)` used to validate and parse the JWT payload.
- `InjectAppRepository(Session)` provides an `AppRepository<Session>` instance which exposes `findOne`.
- `Session` entity is defined under `src/modules/app/auth-base/session/entities/session.entity` and is referenced for the repository injection and relations.

Where to find code

- Module: `src/modules/core/context/context.module.ts`
- Service: `src/modules/core/context/context.service.ts`
