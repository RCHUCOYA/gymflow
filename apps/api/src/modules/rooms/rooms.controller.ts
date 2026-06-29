import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import { listRooms, listRoomSchedules } from "./rooms.service.js";

const roomIdSchema = z.object({
  roomId: z.string().uuid()
});

export const listRoomsController: RequestHandler = async (_request, response, next) => {
  try {
    const rooms = await listRooms();
    return sendSuccess(response, httpStatus.ok, rooms, "Salas disponibles");
  } catch (error) {
    return next(error);
  }
};

export const listRoomSchedulesController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = roomIdSchema.safeParse(request.params);

    if (!parsed.success) {
      return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "ID de sala invalido"));
    }

    const schedules = await listRoomSchedules(parsed.data.roomId);
    return sendSuccess(response, httpStatus.ok, schedules, "Horarios disponibles");
  } catch (error) {
    return next(error);
  }
};
