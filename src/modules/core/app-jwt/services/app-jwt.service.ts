import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppJwtToken } from 'src/common/types/app-jwt-token.type';
import { TokenType } from '../enums/token-type.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { TokePayload } from '../types/token-payload.type';

@Injectable()
export class AppJwtService {
  constructor(private readonly jwtService: JwtService) {}

  private decodeToken(token: string): TokePayload {
    const decoded: TokePayload = this.jwtService.verify(token);
    return decoded;
  }

  generateAppJwtToken(
    sessionId: string,
    accessTokenExpiresAt: Date,
    refreshTokenExpiresAt: Date,
  ): AppJwtToken {
    const now = new Date();

    const accessToken = this.jwtService.sign({
      sessionId,
      type: TokenType.ACCESS_TOKEN,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(accessTokenExpiresAt.getTime() / 1000),
    });

    const refreshToken = this.jwtService.sign({
      sessionId,
      type: TokenType.REFRESH_TOKEN,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(refreshTokenExpiresAt.getTime() / 1000),
    });

    return {
      refreshToken,
      accessToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  validateAccessToken(token: string) {
    try {
      const payload = this.decodeToken(token);
      if (payload.type != TokenType.ACCESS_TOKEN) return;
      return payload;
    } catch (error) {
      throw error;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const payload: TokePayload = this.decodeToken(token);
      if (payload.type != TokenType.REFRESH_TOKEN) throw new Error();
      return payload;
    } catch (error) {}
  }
}
