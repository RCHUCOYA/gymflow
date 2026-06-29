import { Router } from "express";
import { listRoomsController, listRoomSchedulesController } from "./rooms.controller.js";

export const roomsRouter = Router();

roomsRouter.get("/rooms", listRoomsController);
roomsRouter.get("/rooms/:roomId/schedules", listRoomSchedulesController);
