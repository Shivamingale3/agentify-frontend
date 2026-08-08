export enum AuthProvider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
  GITHUB = "github",
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum ApiErrorCode {
  UNAUTHORIZED = "unauthorized",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMITED = "rate_limited",
  UNKNOWN = "unknown",
}