import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import { requireUser } from "../../utils/controller.js";
import {
  cancelReservationSchema,
  createReservation,
  createReservationSchema,
  cancelReservation,
  listMyReservations
} from "./reservations.service.js";

export const createReservationController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);

    const parsed = createReservationSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const reservation = await createReservation({
      userId: user.id,
      roomScheduleId: parsed.data.roomScheduleId
    });

    return sendSuccess(response, httpStatus.created, reservation, "Reserva creada");
  } catch (error) {
    return next(error);
  }
};

export const cancelReservationController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);

    const parsed = cancelReservationSchema.safeParse(request.params);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "ID de reserva invalido")
      );
    }

    const result = await cancelReservation({
      userId: user.id,
      reservationId: parsed.data.reservationId
    });

    return sendSuccess(response, httpStatus.ok, result, "Reserva cancelada");
  } catch (error) {
    return next(error);
  }
};

export const listMyReservationsController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const reservations = await listMyReservations(user.id);

    return sendSuccess(response, httpStatus.ok, reservations, "Reservas del usuario");
  } catch (error) {
    return next(error);
  }
};
