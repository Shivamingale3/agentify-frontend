import type { User } from '@prisma/client';
import { env } from '../config/env.config.js';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function createAccessToken(user: Pick<User, 'userId' | 'email'>): string {
  return jwt.sign(user, env.TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
    algorithm: 'RS512',
  });
}

export function createRefreshToken(user: Pick<User, 'userId' | 'email'>): string {
  return jwt.sign(user, env.TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
    algorithm: 'RS512',
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.TOKEN_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.TOKEN_SECRET) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token);
  if (decoded === null || typeof decoded === 'string') {
    return null;
  }
  return decoded as TokenPayload;
}

export function getExpirationDate(token: string): number | undefined {
  const decoded = jwt.decode(token, { complete: true });
  return (decoded?.payload as TokenPayload | undefined)?.exp;
}

export function isTokenExpired(token: string): boolean {
  const exp = getExpirationDate(token);
  if (exp === undefined) return true;
  return Date.now() >= exp * 1000;
}
