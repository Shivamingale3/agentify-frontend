import type { User } from '@prisma/client';
import { db } from '../config/db.config.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { HttpException } from '../exceptions/http.exception.js';

export async function getUserByEmailService(
  email: string,
): Promise<Pick<User, 'email' | 'password' | 'userId'>> {
  try {
    return await db.user.findUniqueOrThrow({
      where: { email },
      select: {
        userId: true,
        email: true,
        password: true,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new HttpException(404, 'No user found by this email!');
      }
    }
    throw new HttpException(500, 'Internal server error!');
  }
}

export async function createUserService(
  user: Omit<User, 'createdAt' | 'updatedAt' | 'userId'>,
): Promise<Pick<User, 'email' | 'password' | 'userId'>> {
  try {
    return await db.user.create({
      data: user,
      select: {
        userId: true,
        email: true,
        password: true,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new HttpException(409, 'User already exists!');
      }
    }
    throw new HttpException(500, 'Internal server error!');
  }
}
