export const API_PREFIX = "/api/v1";

export const requestLimits = {
  authWindowMs: 15 * 60 * 1000,
  authMaxRequests: 50
} as const;
