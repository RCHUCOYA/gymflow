import type { RequestHandler } from "express";
import { AppError } from "./app-error.js";
import { httpStatus } from "./http-status.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Asserts the request has an authenticated user and returns it.
 * Used in controllers after authenticate middleware has already run.
 */
export function requireUser(
  request: Parameters<RequestHandler>[0]
): NonNullable<typeof request.user> {
  if (!request.user) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
  }

  return request.user;
}

/**
 * Validates a path param is a valid UUID and returns it as string.
 */
export function parseUuidParam(value: unknown, label: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new AppError(httpStatus.badRequest, "VALIDATION_ERROR", `${label} invalido`);
  }

  return value;
}
