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
  RATE_LIMITED = "rate_limited",
  UNKNOWN = "unknown",
}