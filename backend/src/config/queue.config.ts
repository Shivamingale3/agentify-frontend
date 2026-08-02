import { Queue, Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.config.js';
import type { SendVerifyEmailBody } from '../types/auth.types.js';
import { sendVerifyEmailSchema } from '../validationSchemas/auth.schema.js';
import { sendEmail } from '../services/email/email.service.js';
import { logger } from '../utils/logger.js';

class QueueConfig {
  private queueSourceRedis = new Redis({
    host: env.REDIS_QUEUE_HOST,
    port: env.REDIS_QUEUE_PORT,
    password: env.REDIS_QUEUE_PASSWORD,
    maxRetriesPerRequest: null,
  });

  emailQueue = new Queue<SendVerifyEmailBody>('email-jobs-queue', {
    connection: this.queueSourceRedis,
  });

  emailWorker = new Worker(
    'email-jobs-queue',
    async (job: Job): Promise<void> => {
      const payload = sendVerifyEmailSchema.parse(job.data);
      logger.info(`Sending verification email to ${payload.email}`);

      await sendEmail({
        to: payload.email,
        templateName: 'verify-email',
        data: payload,
      });

      logger.info(`Verify-email delivered for user ${payload.userId}`);
    },
    {
      connection: this.queueSourceRedis,
    },
  );

  constructor() {
    // Structured failure logging — BullMQ already marks the job as failed and
    // applies its retry policy; we only add observability here. The worker
    // process itself never crashes on a single job error.
    this.emailWorker.on('failed', (job, error) => {
      logger.error(
        `email-jobs-queue: job ${job?.id ?? '<unknown>'} failed (${job?.attemptsMade ?? 0} attempts): ${error.message}`,
      );
    });
  }
}

export const queueConfig = new QueueConfig();