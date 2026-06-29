import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { membershipsRouter } from "../modules/memberships/memberships.routes.js";
import { professionalsRouter } from "../modules/professionals/professionals.routes.js";
import { reservationsRouter } from "../modules/reservations/reservations.routes.js";
import { roomsRouter } from "../modules/rooms/rooms.routes.js";
import { storeRouter } from "../modules/store/store.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(membershipsRouter);
apiRouter.use(roomsRouter);
apiRouter.use(reservationsRouter);
apiRouter.use(professionalsRouter);
apiRouter.use(storeRouter);
