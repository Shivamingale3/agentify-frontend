import type { NextFunction, Request, Response } from 'express';
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAuthCookies,
} from '../services/cookie.service.js';
import { verifyAccessToken } from '../services/token.service.js';
import { HttpException } from '../exceptions/http.exception.js';
import { refreshSessionService } from '../services/auth.service.js';
import { PUBLIC_ROUTES } from '../constants/auth.constants.js';

export const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const path = request.path;

    if (PUBLIC_ROUTES.includes(path)) {
      next();
      return;
    }

    const accessToken = getAccessTokenCookie(request);
    if (!accessToken) {
      throw new HttpException(401, 'Unauthorized, missing credentials');
    }

    // Verify signature but allow expired tokens so we can silently refresh
    const payload = verifyAccessToken(accessToken, { ignoreExpiration: true });
    if (!payload) {
      throw new HttpException(401, 'Unauthorized, invalid credentials');
    }

    // Silent token rotation: if the access token is expired, use the
    // refresh token to issue a new pair without interrupting the request.
    if (payload.exp * 1000 < Date.now()) {
      const refreshToken = getRefreshTokenCookie(request);
      if (!refreshToken) {
        throw new HttpException(401, 'Unauthorized, missing credentials');
      }
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshSessionService(refreshToken);

      setAuthCookies(response, newAccessToken, newRefreshToken);
    }

    request.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
