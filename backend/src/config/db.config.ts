import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { env } from './env.config.js';

const adapter = new PrismaLibSql({
  url: env.DATABASE_URL,
});

export const db = new PrismaClient({ adapter });
