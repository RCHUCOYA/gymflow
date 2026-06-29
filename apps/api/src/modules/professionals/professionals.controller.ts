import type { RequestHandler } from "express";
import { ProfessionalType } from "@prisma/client";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import {
  addNutritionPlan,
  addTrainingProgress,
  bookAppointment,
  bookAppointmentSchema,
  cancelAppointment,
  listClientAppointments,
  listProfessionals,
  listStaffAppointments,
  nutritionPlanSchema,
  progressSchema
} from "./professionals.service.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireUser(request: Parameters<RequestHandler>[0]): NonNullable<typeof request.user> {
  if (!request.user) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
  }

  return request.user;
}

function parseUuidParam(value: unknown, label: string) {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw new AppError(httpStatus.badRequest, "VALIDATION_ERROR", `${label} invalido`);
  }

  return value;
}

// ─── Listing ─────────────────────────────────────────────────────────────────

export const listTrainersController: RequestHandler = async (_request, response, next) => {
  try {
    const trainers = await listProfessionals(ProfessionalType.trainer);
    return sendSuccess(response, httpStatus.ok, trainers, "Entrenadores disponibles");
  } catch (error) {
    return next(error);
  }
};

export const listNutritionistsController: RequestHandler = async (_request, response, next) => {
  try {
    const nutritionists = await listProfessionals(ProfessionalType.nutritionist);
    return sendSuccess(response, httpStatus.ok, nutritionists, "Nutricionistas disponibles");
  } catch (error) {
    return next(error);
  }
};

// ─── Booking ─────────────────────────────────────────────────────────────────

export const bookTrainerController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const professionalProfileId = parseUuidParam(request.params.professionalId, "ID de profesional");
    const parsed = bookAppointmentSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const appointment = await bookAppointment({
      clientId: user.id,
      professionalProfileId,
      type: ProfessionalType.trainer,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt)
    });

    return sendSuccess(response, httpStatus.created, appointment, "Cita con entrenador creada");
  } catch (error) {
    return next(error);
  }
};

export const bookNutritionistController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const professionalProfileId = parseUuidParam(request.params.professionalId, "ID de profesional");
    const parsed = bookAppointmentSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const appointment = await bookAppointment({
      clientId: user.id,
      professionalProfileId,
      type: ProfessionalType.nutritionist,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt)
    });

    return sendSuccess(response, httpStatus.created, appointment, "Cita con nutricionista creada");
  } catch (error) {
    return next(error);
  }
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export const listMyAppointmentsController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const appointments = await listClientAppointments(user.id);
    return sendSuccess(response, httpStatus.ok, appointments, "Mis citas");
  } catch (error) {
    return next(error);
  }
};

export const cancelAppointmentController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const appointmentId = parseUuidParam(request.params.appointmentId, "ID de cita");

    const result = await cancelAppointment({
      requesterId: user.id,
      requesterRole: user.role,
      appointmentId
    });

    return sendSuccess(response, httpStatus.ok, result, "Cita cancelada");
  } catch (error) {
    return next(error);
  }
};

// ─── Staff ────────────────────────────────────────────────────────────────────

export const listStaffAppointmentsController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const appointments = await listStaffAppointments(user.id);
    return sendSuccess(response, httpStatus.ok, appointments, "Agenda de profesional");
  } catch (error) {
    return next(error);
  }
};

// ─── Progress / Nutrition ────────────────────────────────────────────────────

export const addProgressController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const appointmentId = parseUuidParam(request.params.appointmentId, "ID de cita");
    const parsed = progressSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const progress = await addTrainingProgress({
      trainerId: user.id,
      appointmentId,
      notes: parsed.data.notes,
      metrics: parsed.data.metrics ?? {}
    });

    return sendSuccess(response, httpStatus.created, progress, "Progreso registrado");
  } catch (error) {
    return next(error);
  }
};

export const addNutritionPlanController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const appointmentId = parseUuidParam(request.params.appointmentId, "ID de cita");
    const parsed = nutritionPlanSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const plan = await addNutritionPlan({
      nutritionistId: user.id,
      appointmentId,
      title: parsed.data.title,
      description: parsed.data.description
    });

    return sendSuccess(response, httpStatus.created, plan, "Plan nutricional registrado");
  } catch (error) {
    return next(error);
  }
};
