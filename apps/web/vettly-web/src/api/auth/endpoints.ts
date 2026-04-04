export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
} as const;

export const AUTH_ERRORS = {
  ACCOUNT_NOT_FOUND: "account_not_found",
  OAUTH_FAILED: "oauth_failed",
  NO_EMAIL: "no_email",
} as const;
