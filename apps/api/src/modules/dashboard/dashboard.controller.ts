import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import { getDashboardSummary } from "./dashboard.service.js";

const querySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional()
});

export const dashboardSummaryController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      return next(new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado"));
    }

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Parametros invalidos"));
    }

    const summary = await getDashboardSummary({
      ...(parsed.data.from ? { from: parsed.data.from } : {}),
      ...(parsed.data.to ? { to: parsed.data.to } : {})
    });
    return sendSuccess(response, httpStatus.ok, summary, "Resumen del dashboard");
  } catch (error) {
    return next(error);
  }
};
