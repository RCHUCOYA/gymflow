import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import {
  changeUserRole,
  getCurrentUser,
  listAllUsers,
  listUsersQuerySchema,
  updateMe,
  updateMeSchema,
  updateRoleSchema
} from "./users.service.js";

export const getMeController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const result = await getCurrentUser(request.user.id);

    return sendSuccess(response, httpStatus.ok, result, "Perfil obtenido");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const patchMeController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const payload = updateMeSchema.parse(request.body);
    const result = await updateMe(request.user.id, payload);

    return sendSuccess(response, httpStatus.ok, result, "Perfil actualizado");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const listUsersController: RequestHandler = async (request, response, next) => {
  try {
    const payload = listUsersQuerySchema.parse(request.query);
    const result = await listAllUsers(payload);

    return sendSuccess(response, httpStatus.ok, result, "Usuarios listados");
  } catch (error) {
    return next(mapValidationError(error));
  }
};

export const updateRoleController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const payload = updateRoleSchema.parse(request.body);
    const rawUserId = request.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      throw new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "userId es requerido");
    }

    const result = await changeUserRole({
      actorUserId: request.user.id,
      userId,
      roleId: payload.roleId
    });

    return sendSuccess(response, httpStatus.ok, result, "Rol actualizado");
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
