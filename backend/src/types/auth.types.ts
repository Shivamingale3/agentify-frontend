import type z from 'zod';
import type { COOKIE_NAMES } from '../constants/auth.constants.js';
import type {
  accessTokenSchema,
  loginSchema,
  refreshTokenSchema,
  registerUserSchema,
  sendVerifyEmailSchema,
  verifyEmailSchema,
} from '../validationSchemas/auth.schema.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload;
  }
}

export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];
export type AccessTokenPayload = z.infer<typeof accessTokenSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterUserBody = z.infer<typeof registerUserSchema>;
export type SendVerifyEmailBody = z.infer<typeof sendVerifyEmailSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;
