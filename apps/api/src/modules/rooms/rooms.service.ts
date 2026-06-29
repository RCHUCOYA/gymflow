import { z } from "zod";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

export const roomScheduleIdSchema = z.object({
  roomId: z.string().uuid()
});

export async function listRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      capacity: true,
      status: true
    }
  });

  return rooms;
}

export async function listRoomSchedules(roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, status: "active" }
  });

  if (!room) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Sala no encontrada o inactiva");
  }

  const now = new Date();

  const schedules = await prisma.roomSchedule.findMany({
    where: {
      roomId,
      status: "active",
      startsAt: { gte: now }
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      roomId: true,
      startsAt: true,
      endsAt: true,
      quota: true,
      _count: {
        select: {
          reservations: {
            where: { status: "confirmed" }
          }
        }
      }
    }
  });

  return schedules.map((schedule) => ({
    id: schedule.id,
    roomId: schedule.roomId,
    startsAt: schedule.startsAt,
    endsAt: schedule.endsAt,
    quota: schedule.quota,
    confirmedCount: schedule._count.reservations,
    availableSlots: schedule.quota - schedule._count.reservations
  }));
}
