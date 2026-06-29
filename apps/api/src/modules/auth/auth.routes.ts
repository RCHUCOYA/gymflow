import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerController);
authRouter.post("/auth/login", loginController);
authRouter.post("/auth/refresh", refreshController);
authRouter.post("/auth/logout", authenticate, logoutController);
authRouter.post("/auth/forgot-password", forgotPasswordController);
