import { app } from './app.js';
import { db } from './config/db.config.js';
import { connectRedis, disconnectRedis } from './config/cache.config.js';
import { env } from './config/env.config.js';
import { logger } from './utils/logger.js';

async function startServer(): Promise<void> {
  try {
    // Database Health Check
    await db.$connect();
    logger.info('Database connection established successfully.');

    // Redis Cache Connection & Health Check
    await connectRedis();

    // Start Express Server
    const server = app.listen(env.APP_PORT, () => {
      logger.info(`Server is running on port ${env.APP_PORT}`);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      await new Promise<void>((resolve) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing server:', err);
          }
          resolve();
        });
      });

      try {
        await db.$disconnect();
        await disconnectRedis();
        logger.info('Graceful shutdown completed successfully.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
    process.on('SIGINT', () => void handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to connect to services or start the server:', error);
    process.exit(1);
  }
}

startServer().catch((error: unknown) => {
  logger.error('Unexpected error during startup:', error);
  process.exit(1);
});
