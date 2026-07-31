import { db } from '../config/db.config.js';
import bcrypt from 'bcrypt';
import { HttpException } from '../exceptions/http.exception.js';
import type { User } from '@prisma/client';

export async function loginService({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Omit<User, 'password' | 'createdAt' | 'updatedAt'>> {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      userId: true,
      email: true,
      password: true,
    },
  });
  if (!user) {
    throw new HttpException(404, 'No user found by this email!');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpException(400, 'Invalid credentials!');
  }
  return user;
}
