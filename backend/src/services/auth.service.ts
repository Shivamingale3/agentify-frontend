import { db } from '../config/db.config.js';
import bcrypt from 'bcrypt';
import { HttpException } from '../exceptions/http.exception.js';
import type { User, UserSession } from '@prisma/client';
import {
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
  getExpirationDate,
} from './token.service.js';
import { hashString } from '../utils/hash.utils.js';
import { ulid } from 'ulid';
import { getDeviceInfo } from '../utils/http.utils.js';
import { createUserSession, deleteSession } from './session.service.js';
import { logger } from '../utils/logger.js';
import cacheService from './cache.service.js';
import { createUserService, getUserByEmailService } from './user.service.js';
import type { Request } from 'express';
import type { RegisterUserBody } from '../types/auth.types.js';

export async function loginService({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Pick<User, 'userId' | 'email'>> {
  const user = await getUserByEmailService(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpException(400, 'Invalid credentials!');
  }
  return user;
}

export async function registerService({
  email,
  password,
  firstName,
  lastName,
}: RegisterUserBody): Promise<Pick<User, 'email' | 'password' | 'userId'>> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUserService({
    email,
    password: hashedPassword,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
  });
  return user;
}

export async function postLoginService({
  request,
  user,
}: {
  request: Request;
  user: Pick<User, 'userId' | 'email'>;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = createAccessToken({ email: user.email, userId: user.userId });

  const sessionId = ulid();

  const refreshToken = createRefreshToken(sessionId);

  const { device, ip, userAgent } = getDeviceInfo(request);

  const sessionPayload: Omit<UserSession, 'createdAt' | 'updatedAt' | 'revokedAt'> = {
    sessionId: sessionId,
    expiresAt: getExpirationDate(refreshToken) ?? null,
    lastUsedAt: null,
    device: device,
    ip: ip,
    userAgent: userAgent,
    userId: user.userId,
    email: user.email,
    refreshTokenHash: hashString(refreshToken),
  };
  await createUserSession(sessionPayload);

  return { accessToken, refreshToken };
}

export async function logoutService(refreshToken: string): Promise<void> {
  const payload = decodeRefreshToken(refreshToken);
  if (!payload) {
    logger.debug(`User tried to logout with invalid refresh token`);
    return;
  }
  await deleteSession(payload.sessionId);
}

export async function refreshSessionService(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = decodeRefreshToken(refreshToken);
  if (!payload) {
    throw new HttpException(401, 'Unauthorized, invalid credentials');
  }

  let session = await cacheService.get<UserSession>(payload.sessionId);
  if (!session) {
    session = await db.userSession.findUnique({
      where: {
        sessionId: payload.sessionId,
      },
    });
    if (!session) {
      throw new HttpException(401, 'Unauthorized, invalid credentials');
    }
    if (session.revokedAt) {
      throw new HttpException(401, 'Unauthorized, invalid credentials');
    }
  }
  const accessToken = createAccessToken({ email: session.email, userId: session.userId });
  const newRefreshToken = createRefreshToken(session.sessionId);
  return { accessToken, refreshToken: newRefreshToken };
}
