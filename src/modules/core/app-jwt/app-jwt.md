## App JWT — code explanation

This file describes the current code in `src/modules/core/app-jwt`.

Files and responsibilities

- `services/app-jwt.service.ts`
  - Exports `AppJwtService`, an `@Injectable()` Nest provider.
  - Constructor injects `JwtService` from `@nestjs/jwt` as `jwtService`.
  - Methods:
    - `private decodeToken(token: string): TokePayload`
      - Calls `this.jwtService.verify(token)` and returns the result cast to `TokePayload`.
      - Wraps the call in a try/catch and throws `AppHttpException(ErrorCodeEnum.UNAUTHORIZED)` on verification failure.

    - `generateAppJwtToken(sessionId: string, accessTokenExpiresAt: Date, refreshTokenExpiresAt: Date): AppJwtToken`
      - Creates `accessToken` and `refreshToken` by signing objects `{ sessionId, type, iat, exp }` using `this.jwtService.sign(...)`.
      - Uses `TokenType.ACCESS_TOKEN` for the access token and `TokenType.REFRESH_TOKEN` for the refresh token.
      - `iat` is set to `Math.floor(now.getTime() / 1000)`; `exp` is set from the provided expiry dates.
      - Returns an `AppJwtToken` object containing both tokens and their expiry dates.

    - `validateAccessToken(token: string)`
      - Calls `this.decodeToken(token)` to obtain `payload`.
      - Returns the `payload` only if `payload.type == TokenType.ACCESS_TOKEN`; otherwise returns `undefined`.
      - Wraps the call in a try/catch and silently returns `undefined` on errors.

    - `validateRefreshToken(token: string)`
      - Calls `this.decodeToken(token)` to obtain `payload`.
      - Throws a generic `Error()` if `payload.type != TokenType.REFRESH_TOKEN`.
      - Returns the `payload` on success.
      - Wraps the call in a try/catch and silently returns `undefined` on errors.

- `types/token-payload.type.ts`
  - Exports `TokePayload` type with properties:
    - `sessionId: string`
    - `type: TokenType`
    - `iat: number`
    - `exp: number`

- `enums/token-type.enum.ts`
  - Exports `TokenType` enum with values:
    - `REFRESH_TOKEN = 'REFRESH_TOKEN'`
    - `ACCESS_TOKEN = 'ACCESS_TOKEN'`

Imports and referenced types

- `AppJwtToken` from `src/common/types/app-jwt-token.type` is the return type for `generateAppJwtToken`.
- `AppHttpException` and `ErrorCodeEnum.UNAUTHORIZED` are used in `decodeToken` error handling.

Where to find code

- Service: `src/modules/core/app-jwt/services/app-jwt.service.ts`
- Token payload type: `src/modules/core/app-jwt/types/token-payload.type.ts`
- Token type enum: `src/modules/core/app-jwt/enums/token-type.enum.ts`
