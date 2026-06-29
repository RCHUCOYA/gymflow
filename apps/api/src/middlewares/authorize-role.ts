import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { httpStatus } from "../utils/http-status.js";

export function authorizeRole(roles: string[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) {
      return next(new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado"));
    }

    if (!roles.includes(request.user.role)) {
      return next(new AppError(httpStatus.forbidden, "FORBIDDEN", "No tienes permisos para esta accion"));
    }

    return next();
  };
}
