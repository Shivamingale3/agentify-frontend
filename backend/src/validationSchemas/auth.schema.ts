import z from 'zod';

export const loginSchema = z.object({
  email: z.email().nonoptional(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,16}$/,
      'Password must be between 8 to 16 characters long and must have at least a capital, a small, a character and a number!',
    ),
});

export const registerUserSchema = z.object({
  email: z.email().nonoptional('Email is required'),
  firstName: z
    .string()
    .min(3, 'First name must be atleast 3 chars long!')
    .max(50, 'First name must not be more than 50 chars long!')
    .optional(),
  lastName: z
    .string()
    .min(3, 'Last name must be atleast 3 chars long!')
    .max(50, 'Last name must not be more than 50 chars long!')
    .optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,16}$/,
      'Password must be between 8 to 16 characters long and must have at least a capital, a small, a character and a number!',
    ),
});

export const baseTokenSchema = z.object({
  iat: z.number(),
  exp: z.number(),
});

export const accessTokenSchema = baseTokenSchema.extend({
  userId: z.string(),
  email: z.email(),
});

export const refreshTokenSchema = baseTokenSchema.extend({
  sessionId: z.string(),
});

export const sendVerifyEmailSchema = z.object({
  email: z.email().nonoptional('Email is required to send verification email'),
  userId: z.string().nonoptional('userId is required to send verfification email'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  token: z.string().nonoptional('token is required to send verification email'),
  verificationUrl: z
    .url()
    .nonoptional('verificationUrl is required to send verification email'),
});

/**
 * Payload for `POST /api/auth/verify-email` — the token the email's CTA button
 * submits back to the backend.
 */
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .nonoptional('token is required to verify email'),
});
