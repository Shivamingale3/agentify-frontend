import z from 'zod';

const envSchema = z
  .object({
    APP_PORT: z.coerce.number().default(5000).nonoptional(),
    APP_ENV: z
      .enum(['development', 'test', 'production'], {
        error: 'App enviroment can be development , test or production',
      })
      .nonoptional(),
    DATABASE_URL: z.string().nonoptional(),

    // Multi-provider AI configuration.
    // Pick ONE provider via AI_PROVIDER (defaults to groq); only the
    // matching API key is required, validated below via superRefine.
    AI_PROVIDER: z.enum(['groq', 'gemini']).default('groq'),
    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  })
  .superRefine((val, ctx) => {
    if (val.AI_PROVIDER === 'groq' && !val.GROQ_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        message: 'GROQ_API_KEY is required when AI_PROVIDER=groq',
        path: ['GROQ_API_KEY'],
      });
    }
    if (val.AI_PROVIDER === 'gemini' && !val.GEMINI_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        message: 'GEMINI_API_KEY is required when AI_PROVIDER=gemini',
        path: ['GEMINI_API_KEY'],
      });
    }
  });

export default envSchema;
