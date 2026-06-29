import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import {
  addNutritionPlanController,
  addProgressController,
  bookNutritionistController,
  bookTrainerController,
  cancelAppointmentController,
  listMyAppointmentsController,
  listNutritionistsController,
  listStaffAppointmentsController,
  listTrainersController
} from "./professionals.controller.js";

const customerOnly = authorizeRole(["Cliente"]);
const staffOnly = authorizeRole(["Entrenador", "Nutricionista"]);
const trainerOnly = authorizeRole(["Entrenador"]);
const nutritionistOnly = authorizeRole(["Nutricionista"]);

export const professionalsRouter = Router();

// Public listings
professionalsRouter.get("/trainers", listTrainersController);
professionalsRouter.get("/nutritionists", listNutritionistsController);

// Client: book professional
professionalsRouter.post(
  "/trainers/:professionalId/appointments",
  authenticate,
  customerOnly,
  bookTrainerController
);
professionalsRouter.post(
  "/nutritionists/:professionalId/appointments",
  authenticate,
  customerOnly,
  bookNutritionistController
);

// Client: my appointments
professionalsRouter.get("/appointments/me", authenticate, customerOnly, listMyAppointmentsController);
professionalsRouter.patch(
  "/appointments/:appointmentId/cancel",
  authenticate,
  cancelAppointmentController
);

// Staff: agenda
professionalsRouter.get("/staff/appointments", authenticate, staffOnly, listStaffAppointmentsController);

// Staff: progress and nutrition (role enforced in service layer too — RN-023, RN-024)
professionalsRouter.post(
  "/appointments/:appointmentId/progress",
  authenticate,
  trainerOnly,
  addProgressController
);
professionalsRouter.post(
  "/appointments/:appointmentId/nutrition-plan",
  authenticate,
  nutritionistOnly,
  addNutritionPlanController
);
