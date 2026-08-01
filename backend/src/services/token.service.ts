import type { User } from '@prisma/client';
import { env } from '../config/env.config.js';
import jwt from 'jsonwebtoken';
import {
  accessTokenSchema,
  baseTokenSchema,
  refreshTokenSchema,
} from '../validationSchemas/auth.schema.js';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.types.js';

export function createAccessToken(user: Pick<User, 'userId' | 'email'>): string {
  return jwt.sign(user, env.TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
    algorithm: 'RS512',
  });
}

export function createRefreshToken(sessionId: string): string {
  return jwt.sign({ sessionId }, env.TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
    algorithm: 'RS512',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.TOKEN_SECRET);
  return accessTokenSchema.parse(payload);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.TOKEN_SECRET);
  return refreshTokenSchema.parse(payload);
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  const decoded = jwt.decode(token);
  const result = accessTokenSchema.safeParse(decoded);
  return result.success ? result.data : null;
}

export function decodeRefreshToken(token: string): RefreshTokenPayload | null {
  const decoded = jwt.decode(token);
  const result = refreshTokenSchema.safeParse(decoded);
  return result.success ? result.data : null;
}

export function getExpirationDate(token: string): number | undefined {
  const decoded = jwt.decode(token, { complete: true });
  const result = baseTokenSchema.safeParse(decoded?.payload);
  return result.success ? result.data.exp : undefined;
}

export function isTokenExpired(token: string): boolean {
  const exp = getExpirationDate(token);
  if (exp === undefined) return true;
  return Date.now() >= exp * 1000;
}
