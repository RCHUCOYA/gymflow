import type { Response } from "express";

type SuccessPayload<TData> = {
  success: true;
  data: TData;
  message: string;
};

type ErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
};

export function sendSuccess<TData>(
  response: Response,
  statusCode: number,
  data: TData,
  message = "Operacion realizada correctamente"
): Response {
  const payload: SuccessPayload<TData> = {
    success: true,
    data,
    message
  };

  return response.status(statusCode).json(payload);
}

export function sendError(
  response: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown[]
): Response {
  const error = details ? { code, message, details } : { code, message };
  const payload: ErrorPayload = {
    success: false,
    error
  };

  return response.status(statusCode).json(payload);
}
