import type { RequestHandler } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";
import {
  forgotPassword,
  forgotPasswordSchema,
  login,
  loginSchema,
  logout,
  logoutSchema,
  refresh,
  refreshSchema,
  register,
  registerSchema
} from "./auth.service.js";

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const payload = registerSchema.parse(request.body);
    const result = await register(payload);

    return sendSuccess(response, httpStatus.created, result, "Usuario registrado");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await login(payload);

    return sendSuccess(response, httpStatus.ok, result, "Sesion iniciada");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const refreshController: RequestHandler = async (request, response, next) => {
  try {
    const payload = refreshSchema.parse(request.body);
    const result = await refresh(payload.refreshToken);

    return sendSuccess(response, httpStatus.ok, result, "Token renovado");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const logoutController: RequestHandler = (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const payload = logoutSchema.parse(request.body ?? {});

    logout(request.user.id, payload.refreshToken);

    return response.status(httpStatus.noContent).send();
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const forgotPasswordController: RequestHandler = (request, response, next) => {
  try {
    const payload = forgotPasswordSchema.parse(request.body);
    const result = forgotPassword(payload.email);

    return sendSuccess(response, httpStatus.ok, result, "Solicitud registrada");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

function mapValidationError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === "object" && "issues" in error) {
    return new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", [error]);
  }

  return error;
}
