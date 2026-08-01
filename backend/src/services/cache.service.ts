import type { ZodType } from 'zod';
import { cache } from '../config/cache.config.js';
import { logger } from '../utils/logger.js';

export class CacheService {
  /**
   * Retrieves a value from Redis cache.
   * If a Zod schema is provided, the parsed JSON is validated against it.
   * If validation fails or the key is not found, returns `null`.
   */
  async get<T>(key: string, schema?: ZodType<T>): Promise<T | null> {
    try {
      const rawData = await cache.get(key);
      if (rawData === null) {
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawData);
      } catch (parseError) {
        logger.error(`Cache JSON parse error for key "${key}":`, parseError);
        return null;
      }

      if (schema) {
        const validation = schema.safeParse(parsed);
        if (!validation.success) {
          logger.warn(
            `Cache schema validation failed for key "${key}": ${validation.error.message}`,
          );
          return null;
        }
        return validation.data;
      }

      return parsed as T;
    } catch (error) {
      logger.error(`Error retrieving key "${key}" from cache:`, error);
      return null;
    }
  }

  /**
   * Stores a value in Redis cache with an optional TTL (in seconds).
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await cache.set(key, serialized, { EX: ttlSeconds });
      } else {
        await cache.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Error setting key "${key}" in cache:`, error);
    }
  }

  /**
   * High-level helper: Attempts to retrieve a value from cache.
   * On cache miss or validation failure, executes `fetcher()`, stores the fresh result in cache, and returns it.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number,
    schema?: ZodType<T>,
  ): Promise<T> {
    const cachedValue = await this.get<T>(key, schema);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const freshValue = await fetcher();
    await this.set(key, freshValue, ttlSeconds);
    return freshValue;
  }

  /**
   * Deletes one or multiple keys from Redis.
   */
  async del(keys: string | string[]): Promise<number> {
    try {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      if (keyArray.length === 0) return 0;
      return await cache.del(keyArray);
    } catch (error) {
      logger.error('Error deleting key(s) from cache:', error);
      return 0;
    }
  }

  /**
   * Checks if a key exists in Redis cache.
   */
  async exists(key: string): Promise<boolean> {
    try {
      const count = await cache.exists(key);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence of key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clears all keys matching a specific pattern (e.g. "user:*").
   */
  async clearPattern(pattern: string): Promise<number> {
    try {
      const keys = await cache.keys(pattern);
      if (keys.length > 0) {
        return await cache.del(keys);
      }
      return 0;
    } catch (error) {
      logger.error(`Error clearing pattern "${pattern}" from cache:`, error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
