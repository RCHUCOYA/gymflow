import { z } from "zod";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

export const createReservationSchema = z.object({
  roomScheduleId: z.string().uuid()
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().uuid()
});

export async function createReservation(input: {
  userId: string;
  roomScheduleId: string;
}) {
  const now = new Date();

  const [activeMembership, schedule, existingReservation] = await Promise.all([
    prisma.userMembership.findFirst({
      where: {
        userId: input.userId,
        status: "active",
        endsAt: { gte: now }
      }
    }),
    prisma.roomSchedule.findFirst({
      where: {
        id: input.roomScheduleId,
        status: "active",
        startsAt: { gte: now }
      }
    }),
    prisma.reservation.findUnique({
      where: {
        userId_roomScheduleId: {
          userId: input.userId,
          roomScheduleId: input.roomScheduleId
        }
      }
    })
  ]);

  if (!activeMembership) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "Necesitas una membresia activa para reservar"
    );
  }

  if (!schedule) {
    throw new AppError(
      httpStatus.notFound,
      "NOT_FOUND",
      "Horario no encontrado, inactivo o ya inicio"
    );
  }

  if (existingReservation) {
    throw new AppError(
      httpStatus.conflict,
      "CONFLICT",
      "Ya tienes una reserva para este horario"
    );
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const confirmedCount = await tx.reservation.count({
      where: {
        roomScheduleId: input.roomScheduleId,
        status: "confirmed"
      }
    });

    if (confirmedCount >= schedule.quota) {
      throw new AppError(
        httpStatus.unprocessableEntity,
        "BUSINESS_RULE_ERROR",
        "El horario ya no tiene cupos disponibles"
      );
    }

    return tx.reservation.create({
      data: {
        userId: input.userId,
        roomScheduleId: input.roomScheduleId,
        status: "confirmed"
      },
      include: {
        roomSchedule: {
          include: {
            room: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  });

  return {
    id: reservation.id,
    status: reservation.status,
    roomSchedule: {
      id: reservation.roomSchedule.id,
      startsAt: reservation.roomSchedule.startsAt,
      endsAt: reservation.roomSchedule.endsAt,
      room: {
        id: reservation.roomSchedule.room.id,
        name: reservation.roomSchedule.room.name
      }
    },
    createdAt: reservation.createdAt
  };
}

export async function cancelReservation(input: {
  userId: string;
  reservationId: string;
}) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.reservationId },
    include: {
      roomSchedule: {
        select: { startsAt: true }
      }
    }
  });

  if (!reservation) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Reserva no encontrada");
  }

  if (reservation.userId !== input.userId) {
    throw new AppError(
      httpStatus.forbidden,
      "FORBIDDEN",
      "No tienes permisos para cancelar esta reserva"
    );
  }

  if (reservation.status === "cancelled") {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "La reserva ya esta cancelada"
    );
  }

  const now = new Date();

  if (reservation.roomSchedule.startsAt <= now) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "No puedes cancelar una reserva que ya inicio o ha pasado"
    );
  }

  const cancelled = await prisma.reservation.update({
    where: { id: input.reservationId },
    data: { status: "cancelled" },
    select: {
      id: true,
      status: true,
      updatedAt: true
    }
  });

  return cancelled;
}

export async function listMyReservations(userId: string) {
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      roomSchedule: {
        include: {
          room: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });

  return reservations.map((reservation) => ({
    id: reservation.id,
    status: reservation.status,
    roomSchedule: {
      id: reservation.roomSchedule.id,
      startsAt: reservation.roomSchedule.startsAt,
      endsAt: reservation.roomSchedule.endsAt,
      room: {
        id: reservation.roomSchedule.room.id,
        name: reservation.roomSchedule.room.name
      }
    },
    createdAt: reservation.createdAt
  }));
}
