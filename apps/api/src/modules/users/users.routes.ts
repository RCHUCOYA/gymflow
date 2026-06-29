import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import {
  getMeController,
  listUsersController,
  patchMeController,
  updateRoleController
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/users/me", authenticate, getMeController);
usersRouter.patch("/users/me", authenticate, patchMeController);
usersRouter.get("/users", authenticate, authorizeRole(["Administrador"]), listUsersController);
usersRouter.patch(
  "/users/:userId/role",
  authenticate,
  authorizeRole(["Administrador"]),
  updateRoleController
);
