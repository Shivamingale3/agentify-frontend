import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../lib/apiResponse.js';
import { loginService, logoutService } from '../services/auth.service.js';
import {
  clearAuthCookies,
  getRefreshTokenCookie,
  setAuthCookies,
} from '../services/cookie.service.js';
import type { LoginBody } from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

export async function loginController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = request.body as LoginBody;
    const { accessToken, refreshToken } = await loginService({ email, password, request });
    setAuthCookies(response, accessToken, refreshToken);
    response.status(200).json(ApiResponse.success('Login successful!', null));
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const refreshToken = getRefreshTokenCookie(request);
    if (refreshToken !== undefined) {
      await logoutService(refreshToken);
    } else {
      logger.debug(`User tried to logout with no refresh token`);
    }
    clearAuthCookies(response);
    response.status(200).json(ApiResponse.success('Logout successful!', null));
  } catch (error) {
    next(error);
  }
}
