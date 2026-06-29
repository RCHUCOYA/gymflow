import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { httpStatus } from "../utils/http-status.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorizationHeader = request.header("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Token ausente o invalido"));
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);

    if (!payload.sub || !payload.role) {
      return next(new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Token invalido"));
    }

    request.user = {
      id: payload.sub,
      role: payload.role,
      permissions: payload.permissions
    };

    return next();
  } catch {
    return next(new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Token ausente o expirado"));
  }
};
