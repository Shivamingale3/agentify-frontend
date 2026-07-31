import z from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,16}$/,
      'Password must be between 8 to 16 characters long and must have at least a capital, a small, a character and a number!',
    ),
});
