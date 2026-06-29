import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { sendSuccess } from "../utils/api-response.js";
import { httpStatus } from "../utils/http-status.js";

export const getHealth: RequestHandler = (_request, response) => {
  return sendSuccess(
    response,
    httpStatus.ok,
    {
      service: "gymflow-api",
      status: "ok",
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime())
    },
    "API operativa"
  );
};
