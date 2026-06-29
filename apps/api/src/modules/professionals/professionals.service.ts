import { z } from "zod";
import { ProfessionalType, type Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

// ─── Schemas ────────────────────────────────────────────────────────────────

export const bookAppointmentSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true })
});

export const progressSchema = z.object({
  notes: z.string().min(1).max(2000),
  metrics: z.record(z.string(), z.unknown()).optional()
});

export const nutritionPlanSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(1).max(5000)
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractBenefit(benefits: unknown, key: string): boolean {
  if (!benefits || typeof benefits !== "object" || Array.isArray(benefits)) {
    return false;
  }

  const value = (benefits as Record<string, unknown>)[key];

  return value === true;
}

async function requireActiveMembershipWithBenefit(
  userId: string,
  benefitKey: string,
  errorMessage: string
) {
  const membership = await prisma.userMembership.findFirst({
    where: {
      userId,
      status: "active",
      endsAt: { gte: new Date() }
    },
    include: { membershipPlan: true }
  });

  if (!membership) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "Necesitas una membresia activa para reservar"
    );
  }

  if (!extractBenefit(membership.membershipPlan.benefits, benefitKey)) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      errorMessage
    );
  }
}

// ─── Listing ─────────────────────────────────────────────────────────────────

export async function listProfessionals(type: ProfessionalType) {
  const profiles = await prisma.professionalProfile.findMany({
    where: { type, status: "active" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true
        }
      }
    },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }]
  });

  return profiles.map((profile) => ({
    id: profile.id,
    type: profile.type,
    specialty: profile.specialty,
    bio: profile.bio,
    user: {
      id: profile.user.id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      avatarUrl: profile.user.avatarUrl
    }
  }));
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export async function bookAppointment(input: {
  clientId: string;
  professionalProfileId: string;
  type: ProfessionalType;
  startsAt: Date;
  endsAt: Date;
}) {
  if (input.endsAt <= input.startsAt) {
    throw new AppError(
      httpStatus.badRequest,
      "VALIDATION_ERROR",
      "La hora de fin debe ser posterior a la de inicio"
    );
  }

  if (input.startsAt <= new Date()) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "La cita debe agendarse en el futuro"
    );
  }

  const benefitKey = input.type === ProfessionalType.trainer ? "trainer" : "nutritionist";
  const benefitError =
    input.type === ProfessionalType.trainer
      ? "Tu plan de membresia no incluye sesiones con entrenador personal"
      : "Tu plan de membresia no incluye consultas con nutricionista. Requiere plan Premium o VIP";

  await requireActiveMembershipWithBenefit(input.clientId, benefitKey, benefitError);

  const professional = await prisma.professionalProfile.findFirst({
    where: { id: input.professionalProfileId, type: input.type, status: "active" }
  });

  if (!professional) {
    throw new AppError(
      httpStatus.notFound,
      "NOT_FOUND",
      "Profesional no encontrado o inactivo"
    );
  }

  const [professionalConflict, clientConflict] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        professionalProfileId: input.professionalProfileId,
        status: { in: ["confirmed", "pending"] },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt }
      }
    }),
    prisma.appointment.findFirst({
      where: {
        clientId: input.clientId,
        status: { in: ["confirmed", "pending"] },
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt }
      }
    })
  ]);

  if (professionalConflict) {
    throw new AppError(
      httpStatus.conflict,
      "CONFLICT",
      "El profesional ya tiene una cita en ese horario"
    );
  }

  if (clientConflict) {
    throw new AppError(
      httpStatus.conflict,
      "CONFLICT",
      "Ya tienes una cita agendada en ese horario"
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId: input.clientId,
      professionalProfileId: input.professionalProfileId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: "confirmed"
    },
    include: {
      professionalProfile: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } }
        }
      }
    }
  });

  return mapAppointment(appointment);
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export async function cancelAppointment(input: {
  requesterId: string;
  requesterRole: string;
  appointmentId: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: {
      professionalProfile: {
        select: { userId: true }
      }
    }
  });

  if (!appointment) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Cita no encontrada");
  }

  const isOwner = appointment.clientId === input.requesterId;
  const isProfessional = appointment.professionalProfile.userId === input.requesterId;

  if (!isOwner && !isProfessional) {
    throw new AppError(httpStatus.forbidden, "FORBIDDEN", "No tienes permisos para cancelar esta cita");
  }

  if (appointment.status === "cancelled") {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "La cita ya esta cancelada"
    );
  }

  if (appointment.startsAt <= new Date()) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "No puedes cancelar una cita que ya inicio o ha pasado"
    );
  }

  const cancelled = await prisma.appointment.update({
    where: { id: input.appointmentId },
    data: { status: "cancelled" },
    select: { id: true, status: true, updatedAt: true }
  });

  return cancelled;
}

// ─── Listings ────────────────────────────────────────────────────────────────

export async function listClientAppointments(clientId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId },
    orderBy: { startsAt: "desc" },
    include: {
      professionalProfile: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } }
        }
      },
      trainingProgress: {
        select: { id: true, notes: true, metrics: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      },
      nutritionPlans: {
        select: { id: true, title: true, description: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return appointments.map(mapAppointmentFull);
}

export async function listStaffAppointments(userId: string) {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError(
      httpStatus.notFound,
      "NOT_FOUND",
      "No tienes perfil profesional registrado"
    );
  }

  const appointments = await prisma.appointment.findMany({
    where: { professionalProfileId: profile.id },
    orderBy: { startsAt: "asc" },
    include: {
      client: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      trainingProgress: {
        select: { id: true, notes: true, metrics: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      },
      nutritionPlans: {
        select: { id: true, title: true, description: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return appointments.map((appt) => ({
    id: appt.id,
    status: appt.status,
    startsAt: appt.startsAt,
    endsAt: appt.endsAt,
    client: appt.client,
    trainingProgress: appt.trainingProgress,
    nutritionPlans: appt.nutritionPlans,
    createdAt: appt.createdAt
  }));
}

// ─── Progress / Nutrition ────────────────────────────────────────────────────

export async function addTrainingProgress(input: {
  trainerId: string;
  appointmentId: string;
  notes: string;
  metrics: Record<string, unknown>;
}) {
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: input.trainerId, type: ProfessionalType.trainer }
  });

  if (!profile) {
    throw new AppError(
      httpStatus.forbidden,
      "FORBIDDEN",
      "Solo entrenadores pueden registrar progreso de entrenamiento"
    );
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.appointmentId,
      professionalProfileId: profile.id
    }
  });

  if (!appointment) {
    throw new AppError(
      httpStatus.notFound,
      "NOT_FOUND",
      "Cita no encontrada o no pertenece a tu agenda"
    );
  }

  const progress = await prisma.trainingProgress.create({
    data: {
      appointmentId: input.appointmentId,
      notes: input.notes,
      metrics: input.metrics as Prisma.InputJsonValue
    }
  });

  return {
    id: progress.id,
    appointmentId: progress.appointmentId,
    notes: progress.notes,
    metrics: progress.metrics,
    createdAt: progress.createdAt
  };
}

export async function addNutritionPlan(input: {
  nutritionistId: string;
  appointmentId: string;
  title: string;
  description: string;
}) {
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: input.nutritionistId, type: ProfessionalType.nutritionist }
  });

  if (!profile) {
    throw new AppError(
      httpStatus.forbidden,
      "FORBIDDEN",
      "Solo nutricionistas pueden registrar planes nutricionales"
    );
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.appointmentId,
      professionalProfileId: profile.id
    }
  });

  if (!appointment) {
    throw new AppError(
      httpStatus.notFound,
      "NOT_FOUND",
      "Cita no encontrada o no pertenece a tu agenda"
    );
  }

  const plan = await prisma.nutritionPlan.create({
    data: {
      appointmentId: input.appointmentId,
      title: input.title,
      description: input.description
    }
  });

  return {
    id: plan.id,
    appointmentId: plan.appointmentId,
    title: plan.title,
    description: plan.description,
    createdAt: plan.createdAt
  };
}

// ─── Mappers (DRY) ──────────────────────────────────────────────────────────

type AppointmentWithProfessional = {
  id: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  professionalProfile: {
    id: string;
    type: string;
    user: { id: string; firstName: string; lastName: string };
  };
};

function mapAppointment(appt: AppointmentWithProfessional) {
  return {
    id: appt.id,
    status: appt.status,
    startsAt: appt.startsAt,
    endsAt: appt.endsAt,
    professional: {
      id: appt.professionalProfile.id,
      type: appt.professionalProfile.type,
      user: appt.professionalProfile.user
    },
    createdAt: appt.createdAt
  };
}

type AppointmentFull = AppointmentWithProfessional & {
  trainingProgress: Array<{ id: string; notes: string; metrics: unknown; createdAt: Date }>;
  nutritionPlans: Array<{ id: string; title: string; description: string; createdAt: Date }>;
};

function mapAppointmentFull(appt: AppointmentFull) {
  return {
    ...mapAppointment(appt),
    trainingProgress: appt.trainingProgress,
    nutritionPlans: appt.nutritionPlans
  };
}
