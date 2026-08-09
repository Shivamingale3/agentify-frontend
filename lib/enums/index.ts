/**
 * Machine-readable error codes returned by the backend in `ErrorResponse.code`.
 * Mirrors `com.botify.api.enums.ErrorCode` — the values are compared verbatim,
 * so they must stay identical on both sides.
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  CONFLICT = "CONFLICT",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  PASSWORD_MISMATCH = "PASSWORD_MISMATCH",
  PASSWORD_INVALID = "PASSWORD_INVALID",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_ALREADY_USED = "TOKEN_ALREADY_USED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  /** Local: the backend was unreachable or answered with no usable code. */
  UNKNOWN = "UNKNOWN",
}

/** Codes that carry per-field messages in `ErrorResponse.errors`. */
export const FIELD_ERROR_CODES: readonly ApiErrorCode[] = [
  ApiErrorCode.VALIDATION_ERROR,
  ApiErrorCode.PASSWORD_INVALID,
];

/** Mirrors `com.botify.api.enums.UserRole`. */
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

/** Mirrors `com.botify.api.enums.UserStatus`. */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}
