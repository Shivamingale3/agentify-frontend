import type z from 'zod';
import type { COOKIE_NAMES } from '../constants/auth.constants.js';
import type {
  accessTokenSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validationSchemas/auth.schema.js';

export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];
export type AccessTokenPayload = z.infer<typeof accessTokenSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
