import { db } from '../config/db.config.js';
import bcrypt from 'bcrypt';
import { HttpException } from '../exceptions/http.exception.js';
import type { UserSession } from '@prisma/client';
import {
  createAccessToken,
  createRefreshToken,
  decodeRefreshToken,
  getExpirationDate,
} from './token.service.js';
import { hashString } from '../utils/hash.utils.js';
import { ulid } from 'ulid';
import type { Request } from 'express';
import { getDeviceInfo } from '../utils/http.utils.js';
import { createUserSession, deleteSession } from './session.service.js';
import { logger } from '../utils/logger.js';

export async function loginService({
  email,
  password,
  request,
}: {
  email: string;
  password: string;
  request: Request;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      userId: true,
      email: true,
      password: true,
    },
  });
  if (!user) {
    throw new HttpException(404, 'No user found by this email!');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpException(400, 'Invalid credentials!');
  }

  const accessToken = createAccessToken({ email: email, userId: user.userId });

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
