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
      message: `Password must be at least ${PASSWORD.MIN_LENGTH} characters.`,
    })
    .max(PASSWORD.MAX_LENGTH, {
      message: `Password must be at most ${PASSWORD.MAX_LENGTH} characters.`,
    }),
  rememberMe: z.boolean().optional(),
});

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type LoginFormErrors = Partial<Record<keyof LoginSchemaValues, string[]>>;