import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.js";

const ACCESS_EXPIRES_IN =
  env.JWT_ACCESS_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;
const REFRESH_EXPIRES_IN =
  env.JWT_REFRESH_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN
  });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: decoded.sub ?? "",
    role: String(decoded.role ?? ""),
    permissions: Array.isArray(decoded.permissions)
      ? decoded.permissions.map((permission) => String(permission))
      : []
  };
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid refresh token payload");
  }

  return {
    sub: decoded.sub ?? "",
    role: String(decoded.role ?? ""),
    permissions: Array.isArray(decoded.permissions)
      ? decoded.permissions.map((permission) => String(permission))
      : []
  };
}
