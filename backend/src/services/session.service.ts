import type { UserSession } from '@prisma/client';
import { db } from '../config/db.config.js';
import cacheService from './cache.service.js';

export async function createUserSession(
  session: Omit<UserSession, 'createdAt' | 'updatedAt' | 'revokedAt'>,
): Promise<void> {
  const createdSession = await db.userSession.create({
    data: session,
  });
  await cacheService.set(createdSession.sessionId, JSON.stringify(createdSession));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.userSession.delete({ where: { sessionId } });
  await cacheService.del(sessionId);
}
