import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import { dashboardSummaryController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/dashboard/summary",
  authenticate,
  authorizeRole(["Administrador"]),
  dashboardSummaryController
);
