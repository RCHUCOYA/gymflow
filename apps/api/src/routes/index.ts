import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { membershipsRouter } from "../modules/memberships/memberships.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(membershipsRouter);
