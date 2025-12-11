import { TokenType } from '../enums/token-type.enum';

export type TokePayload = {
  sessionId: string;
  type: TokenType;
  iat: number;
  exp: number;
};
