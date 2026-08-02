import { z } from "zod";

import { EMAIL, PASSWORD } from "@/lib/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .max(EMAIL.MAX_LENGTH, {
      message: `Email must be at most ${EMAIL.MAX_LENGTH} characters.`,
    })
    .email({ message: "Please enter a valid email address." })
    .trim()
    .toLowerCase(),
  password: z
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
    }),
});

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type LoginFormErrors = Partial<
  Record<keyof LoginSchemaValues, string[]>
>;
