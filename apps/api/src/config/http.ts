export const API_PREFIX = "/api/v1";

export const requestLimits = {
  // General API: 200 req / 15 min per IP
  generalWindowMs: 15 * 60 * 1000,
  generalMaxRequests: 200,
  // Auth endpoints: 20 req / 15 min per IP (login, register, forgot-password)
  authWindowMs: 15 * 60 * 1000,
  authMaxRequests: 20,
  // Admin endpoints: 100 req / 15 min per IP
  adminWindowMs: 15 * 60 * 1000,
  adminMaxRequests: 100
} as const;
