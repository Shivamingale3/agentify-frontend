import { z } from "zod";

import { EMAIL, NAME, PASSWORD } from "@/lib/constants";

/**
 * Field-level rules, declared once and composed by every auth schema so a
 * rule change lands in a single place. The *rules* mirror the backend's Bean
 * Validation constraints (`com.botify.api.dto.request.*`) and password policy
 * (`security.password-policy.*`); only the messages differ, to give per-rule
 * feedback instead of one catch-all message.
 */
const emailSchema = z
  .string()
  .min(1, { message: "Email is required." })
  .max(EMAIL.MAX_LENGTH, {
    message: `Email must be at most ${EMAIL.MAX_LENGTH} characters.`,
  })
  .email({ message: "Please enter a valid email address." })
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(PASSWORD.MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD.MIN_LENGTH} characters long.`,
  })
  .max(PASSWORD.MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD.MAX_LENGTH} characters long.`,
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  })
  .regex(/\d/, {
    message: "Password must contain at least one number.",
  })
  .regex(/[^a-zA-Z\d]/, {
    message: "Password must contain at least one special character.",
  });

const confirmPasswordSchema = z
  .string()
  .min(1, { message: "Please confirm your password." });

/**
 * Names are optional on the backend (`@Size` accepts null), so an untouched
 * input (`""`) has to pass. `.refine` is used instead of `.min` so the empty
 * case is exempt from the lower bound without turning the schema into a union.
 */
const optionalNameSchema = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= NAME.MIN_LENGTH, {
      message: `${label} must be at least ${NAME.MIN_LENGTH} characters.`,
    })
    .max(NAME.MAX_LENGTH, {
      message: `${label} must be at most ${NAME.MAX_LENGTH} characters.`,
    })
    .optional();

const tokenSchema = z.string().min(1, { message: "Token is required." });

/** Shared "password + confirmation" check, reused by register and reset. */
const passwordsMatch = (values: {
  password: string;
  confirmPassword: string;
}) => values.password === values.confirmPassword;

const passwordMismatch = {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Payload sent to the backend — `confirmPassword` never leaves the browser. */
export const registerSchema = z.object({
  firstName: optionalNameSchema("First name"),
  lastName: optionalNameSchema("Last name"),
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = registerSchema
  .extend({ confirmPassword: confirmPasswordSchema })
  .refine(passwordsMatch, passwordMismatch);

export const verifyEmailSchema = z.object({ token: tokenSchema });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resendVerificationSchema = z.object({ email: emailSchema });

/**
 * Payload sent to the backend once the new password is submitted. The field is
 * `newPassword` because that is what `ResetPasswordRequest` binds.
 */
export const resetPasswordSchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
});

/**
 * The input is named `newPassword` to match the backend field, so a server
 * error keyed `newPassword` lands on the right input instead of being dropped.
 */
export const resetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((values) => values.newPassword === values.confirmPassword, passwordMismatch);

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type VerifyEmailSchemaValues = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;
export type ResetPasswordSchemaValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
