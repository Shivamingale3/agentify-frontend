import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../lib/apiResponse.js';
import { loginService } from '../services/auth.service.js';
import { loginSchema } from '../validationSchemas/auth.schema.js';

export async function loginController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(request.body);
    const user = await loginService({ email, password });
    response.status(200).json(ApiResponse.success('Login successful!', user));
  } catch (error) {
    next(error);
  }
}
