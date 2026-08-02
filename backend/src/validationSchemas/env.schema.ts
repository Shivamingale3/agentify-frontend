import z from 'zod';

const envSchema = z.object({
  APP_PORT: z.coerce.number().default(5000).nonoptional(),
  APP_ENV: z
    .enum(['development', 'test', 'production'], {
      error: 'App enviroment can be development , test or production',
    })
    .nonoptional(),
  DATABASE_URL: z.string().nonoptional(),
  TOKEN_SECRET: z.string().nonoptional().default('ahVIPpEM64qf4hWSbmD9xvDyiXq4EKrnCP9zSu7dJg'),
  ACCESS_TOKEN_EXPIRY: z
    .string()
    .default('900000')
    .transform((val) => {
      const num = Number(val);
      if (Number.isNaN(num)) throw new Error('ACCESS_TOKEN_EXPIRY must be a number');
      return num;
    }),
  REFRESH_TOKEN_EXPIRY: z
    .string()
    .default('604800000')
    .transform((val) => {
      const num = Number(val);
      if (Number.isNaN(num)) throw new Error('REFRESH_TOKEN_EXPIRY must be a number');
      return num;
    }),
  REDIS_CACHE_URL: z
    .string()
    .nonoptional('REDIS CACHE URL is required!')
    .transform((val) => val.replace(/^http:\/\//, 'redis://').replace(/^https:\/\//, 'rediss://'))
    .refine((val) => val.startsWith('redis://') || val.startsWith('rediss://'), {
      message: 'REDIS CACHE URL must start with redis:// or rediss://',
    }),
  REDIS_CACHE_PASSWORD: z.string().nonoptional('REDIS CACHE PASSWORD is required!'),
  REDIS_QUEUE_HOST: z.string().nonoptional('REDIS QUEUE HOST is required!'),
  REDIS_QUEUE_PORT: z.coerce.number().default(5000).nonoptional(),
  REDIS_QUEUE_PASSWORD: z.string().nonoptional('REDIS QUEUE PASSWORD is required!'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((val) => {
      const origins = val.split(',');
      if (origins.length === 0) throw new Error('ALLOWED_ORIGINS cannot be empty string');
      return origins;
    }),
  FRONTEND_URL: z.url().nonoptional('FRONTEND URL is required!'),
  EMAIL_HOST: z.string().nonoptional('EMAIL_HOST is required!'),
  EMAIL_PORT: z.coerce.number().default(587).nonoptional(),
  EMAIL_USER: z.string().nonoptional('EMAIL_USER is required!'),
  EMAIL_FROM: z.string().nonoptional('EMAIL_FROM is required!'),
  EMAIL_PASSWORD: z.string().nonoptional('EMAIL_PASSWORD is required!'),
});

export default envSchema;
