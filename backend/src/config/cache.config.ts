import { createClient, type RedisClientType } from 'redis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const cache: RedisClientType = createClient({
  url: env.REDIS_CACHE_URL,
  password: env.REDIS_CACHE_PASSWORD,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis Cache: Max reconnection retries reached.');
        return new Error('Redis reconnection failed');
      }
      const delay = Math.min(retries * 200, 3000);
      logger.warn(`Redis Cache: Reconnecting in ${delay}ms (Attempt ${retries})...`);
      return delay;
    },
  },
});

cache.on('connect', () => {
  logger.info('Redis Cache: Connecting to server...');
});

cache.on('ready', () => {
  logger.info('Redis Cache: Connection established and ready for commands.');
});

cache.on('reconnecting', () => {
  logger.warn('Redis Cache: Reconnecting...');
});

cache.on('error', (error: Error) => {
  logger.error(`Redis Cache Error: ${error.message}`);
});

cache.on('end', () => {
  logger.info('Redis Cache: Connection closed.');
});

/**
 * Connects and verifies Redis health during app startup.
 */
export async function connectRedis(): Promise<void> {
  if (!cache.isOpen) {
    await cache.connect();
    const pingResult = await cache.ping();
    logger.info(`Redis Cache: Connection check successful (PING -> ${pingResult}).`);
  }
}

/**
 * Gracefully shuts down the Redis client.
 */
export async function disconnectRedis(): Promise<void> {
  if (cache.isOpen) {
    logger.info('Redis Cache: Disconnecting...');
    await cache.flushAll();
    await cache.quit();
  }
}

export default cache;
