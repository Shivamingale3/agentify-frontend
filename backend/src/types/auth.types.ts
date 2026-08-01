import type { COOKIE_NAMES } from '../constants/auth.constants.js';

export type CookieName = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];
