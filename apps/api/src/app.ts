import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { API_PREFIX, requestLimits } from "./config/http.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

const generalLimiter = rateLimit({
  windowMs: requestLimits.generalWindowMs,
  limit: requestLimits.generalMaxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas solicitudes" } }
});

const authLimiter = rateLimit({
  windowMs: requestLimits.authWindowMs,
  limit: requestLimits.authMaxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Demasiados intentos de autenticacion. Intenta de nuevo en 15 minutos." } }
});

const adminLimiter = rateLimit({
  windowMs: requestLimits.adminWindowMs,
  limit: requestLimits.adminMaxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas solicitudes al panel admin" } }
});

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: true, limit: "512kb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // Apply tiered rate limiting
  app.use(`${API_PREFIX}/auth`, authLimiter);
  app.use(`${API_PREFIX}/admin`, adminLimiter);
  app.use(`${API_PREFIX}/dashboard`, generalLimiter);
  app.use(API_PREFIX, generalLimiter);

  app.use(API_PREFIX, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
