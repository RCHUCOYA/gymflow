import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import {
  cancelReservationController,
  createReservationController,
  listMyReservationsController
} from "./reservations.controller.js";

const customerOnly = authorizeRole(["Cliente"]);

export const reservationsRouter = Router();

reservationsRouter.post("/reservations", authenticate, customerOnly, createReservationController);
reservationsRouter.get("/reservations/me", authenticate, customerOnly, listMyReservationsController);
reservationsRouter.patch(
  "/reservations/:reservationId/cancel",
  authenticate,
  customerOnly,
  cancelReservationController
);
