import type { RequestHandler } from "express";
import { sendError } from "../utils/api-response.js";
import { httpStatus } from "../utils/http-status.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  return sendError(
    response,
    httpStatus.notFound,
    "ROUTE_NOT_FOUND",
    `La ruta ${request.method} ${request.originalUrl} no existe`
  );
};
