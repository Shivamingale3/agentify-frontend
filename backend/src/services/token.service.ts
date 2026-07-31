import type { User } from '@prisma/client';
import { env } from '../config/env.config.js';
import jwt from 'jsonwebtoken';

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

export function verifyAccessToken(token: string): {
  userId: string;
  email: string;
  exp: number;
  iat: number;
} {
  return jwt.verify(token, env.TOKEN_SECRET) as {
    userId: string;
    email: string;
    exp: number;
    iat: number;
  };
}

export function verifyRefreshToken(token: string): {
  userId: string;
  email: string;
  exp: number;
  iat: number;
} {
  return jwt.verify(token, env.TOKEN_SECRET) as {
    userId: string;
    email: string;
    exp: number;
    iat: number;
  };
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}

export function getExpirationDate(token: string) {
  return jwt.decode(token, { complete: true })?.payload.exp;
}
