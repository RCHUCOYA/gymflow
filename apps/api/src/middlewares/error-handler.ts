import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { sendError } from "../utils/api-response.js";
import { httpStatus } from "../utils/http-status.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    return sendError(
      response,
      error.statusCode,
      error.code,
      error.message,
      error.details
    );
  }

  const message =
    env.NODE_ENV === "production" ? "Error interno del servidor" : getErrorMessage(error);

  return sendError(
    response,
    httpStatus.internalServerError,
    "INTERNAL_SERVER_ERROR",
    message
  );
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Error desconocido";
}
