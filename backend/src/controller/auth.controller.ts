import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../lib/apiResponse.js';
import {
  loginService,
  logoutService,
  postLoginService,
  registerService,
} from '../services/auth.service.js';
import {
  clearAuthCookies,
  getRefreshTokenCookie,
  setAuthCookies,
} from '../services/cookie.service.js';
import { postRegisterService } from '../services/post-register.service.js';
import { verifyEmailService } from '../services/verify-email.service.js';
import type { LoginBody, RegisterUserBody, VerifyEmailBody } from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

export async function loginController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = request.body as LoginBody;
    const user = await loginService({ email, password });
    const { accessToken, refreshToken } = await postLoginService({ request, user });
    setAuthCookies(response, accessToken, refreshToken);
    response.status(200).json(ApiResponse.success('Login successful!', null));
  } catch (error) {
    next(error);
  }
}

export async function registerController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, firstName, lastName } = request.body as RegisterUserBody;
    const user = await registerService({ email, password, firstName, lastName });
    const { accessToken, refreshToken } = await postLoginService({ request, user });
    setAuthCookies(response, accessToken, refreshToken);

    // Fire-and-forget: enqueue verify-email. Never blocks / breaks the
    // registration response on a transient infra failure.
    await postRegisterService({
      userId: user.userId,
      email: user.email,
      firstName,
      lastName,
    });

    response.status(200).json(ApiResponse.success('Registered successfully!', null));
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = request.body as VerifyEmailBody;
    await verifyEmailService({ token });
    response.status(200).json(ApiResponse.success('Email verified successfully!', null));
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
