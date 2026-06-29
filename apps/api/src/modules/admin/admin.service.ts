import { z } from "zod";
import { type Prisma, EntityStatus, PromotionTargetType } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";
import { recordAudit } from "../../utils/audit.js";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(2).max(140),
  description: z.string().max(5000).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid(),
  imageUrl: z.string().url().max(500).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const createMembershipPlanSchema = z.object({
  name: z.string().min(2).max(80),
  durationDays: z.number().int().positive(),
  price: z.number().positive(),
  benefits: z.record(z.string(), z.unknown())
});

export const updateMembershipPlanSchema = createMembershipPlanSchema.partial();

export const createRoomSchema = z.object({
  name: z.string().min(2).max(100),
  capacity: z.number().int().positive()
});

export const updateRoomSchema = createRoomSchema.partial();

export const createScheduleSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  quota: z.number().int().positive()
});

export const createPromotionSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(255).optional(),
  discountPercent: z.number().positive().max(100),
  targetType: z.nativeEnum(PromotionTargetType),
  productId: z.string().uuid().optional(),
  membershipPlanId: z.string().uuid().optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true })
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entity: z.string().optional(),
  actorUserId: z.string().uuid().optional()
});

// ─── Products ─────────────────────────────────────────────────────────────────

export async function adminListProducts(input: { page: number; limit: number; search?: string }) {
  const skip = (input.page - 1) * input.limit;
  const where: Prisma.ProductWhereInput = input.search
    ? {
        OR: [
          { name: { contains: input.search, mode: "insensitive" } },
          { category: { name: { contains: input.search, mode: "insensitive" } } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } }
    }),
    prisma.product.count({ where })
  ]);

  return {
    items: items.map((p) => ({
      ...p,
      price: Number(p.price)
    })),
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.ceil(total / input.limit)
  };
}

export async function adminCreateProduct(
  actorUserId: string,
  input: z.infer<typeof createProductSchema>
) {
  const category = await prisma.productCategory.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Categoria no encontrada");
  }

  const slug = buildSlug(input.name);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl ?? null
    }
  });

  await recordAudit({
    actorUserId,
    action: "products.created",
    entity: "Product",
    entityId: product.id,
    metadata: { name: product.name }
  });

  return { ...product, price: Number(product.price) };
}

export async function adminUpdateProduct(
  actorUserId: string,
  productId: string,
  input: z.infer<typeof updateProductSchema>
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Producto no encontrado");
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {})
    }
  });

  await recordAudit({
    actorUserId,
    action: "products.updated",
    entity: "Product",
    entityId: productId,
    metadata: input
  });

  return { ...updated, price: Number(updated.price) };
}

export async function adminToggleProductStatus(actorUserId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Producto no encontrado");
  }

  const nextStatus: EntityStatus =
    product.status === EntityStatus.active ? EntityStatus.inactive : EntityStatus.active;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { status: nextStatus }
  });

  await recordAudit({
    actorUserId,
    action: "products.status.changed",
    entity: "Product",
    entityId: productId,
    metadata: { from: product.status, to: nextStatus }
  });

  return { id: updated.id, status: updated.status };
}

// ─── Membership Plans ────────────────────────────────────────────────────────

export async function adminListMembershipPlans() {
  const plans = await prisma.membershipPlan.findMany({ orderBy: { price: "asc" } });

  return plans.map((p) => ({ ...p, price: Number(p.price) }));
}

export async function adminCreateMembershipPlan(
  actorUserId: string,
  input: z.infer<typeof createMembershipPlanSchema>
) {
  const existing = await prisma.membershipPlan.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new AppError(httpStatus.conflict, "CONFLICT", "Ya existe un plan con ese nombre");
  }

  const plan = await prisma.membershipPlan.create({
    data: {
      name: input.name,
      durationDays: input.durationDays,
      price: input.price,
      benefits: input.benefits as Prisma.InputJsonValue
    }
  });

  await recordAudit({
    actorUserId,
    action: "membership_plans.created",
    entity: "MembershipPlan",
    entityId: plan.id,
    metadata: { name: plan.name }
  });

  return { ...plan, price: Number(plan.price) };
}

export async function adminUpdateMembershipPlan(
  actorUserId: string,
  planId: string,
  input: z.infer<typeof updateMembershipPlanSchema>
) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Plan no encontrado");
  }

  const updated = await prisma.membershipPlan.update({
    where: { id: planId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.durationDays !== undefined ? { durationDays: input.durationDays } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.benefits !== undefined ? { benefits: input.benefits as Prisma.InputJsonValue } : {})
    }
  });

  await recordAudit({
    actorUserId,
    action: "membership_plans.updated",
    entity: "MembershipPlan",
    entityId: planId,
    metadata: input as Prisma.InputJsonValue
  });

  return { ...updated, price: Number(updated.price) };
}

export async function adminTogglePlanStatus(actorUserId: string, planId: string) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Plan no encontrado");
  }

  const nextStatus: EntityStatus =
    plan.status === EntityStatus.active ? EntityStatus.inactive : EntityStatus.active;

  const updated = await prisma.membershipPlan.update({
    where: { id: planId },
    data: { status: nextStatus }
  });

  await recordAudit({
    actorUserId,
    action: "membership_plans.status.changed",
    entity: "MembershipPlan",
    entityId: planId,
    metadata: { from: plan.status, to: nextStatus }
  });

  return { id: updated.id, status: updated.status };
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function adminListRooms() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { schedules: true } } }
  });

  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    status: r.status,
    schedulesCount: r._count.schedules,
    createdAt: r.createdAt
  }));
}

export async function adminCreateRoom(actorUserId: string, input: z.infer<typeof createRoomSchema>) {
  const existing = await prisma.room.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new AppError(httpStatus.conflict, "CONFLICT", "Ya existe una sala con ese nombre");
  }

  const room = await prisma.room.create({ data: input });

  await recordAudit({
    actorUserId,
    action: "rooms.created",
    entity: "Room",
    entityId: room.id,
    metadata: { name: room.name }
  });

  return room;
}

export async function adminUpdateRoom(
  actorUserId: string,
  roomId: string,
  input: z.infer<typeof updateRoomSchema>
) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Sala no encontrada");
  }

  const updated = await prisma.room.update({
    where: { id: roomId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {})
    }
  });

  await recordAudit({
    actorUserId,
    action: "rooms.updated",
    entity: "Room",
    entityId: roomId,
    metadata: input
  });

  return updated;
}

export async function adminToggleRoomStatus(actorUserId: string, roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Sala no encontrada");
  }

  const nextStatus: EntityStatus =
    room.status === EntityStatus.active ? EntityStatus.inactive : EntityStatus.active;

  const updated = await prisma.room.update({
    where: { id: roomId },
    data: { status: nextStatus }
  });

  await recordAudit({
    actorUserId,
    action: "rooms.status.changed",
    entity: "Room",
    entityId: roomId,
    metadata: { from: room.status, to: nextStatus }
  });

  return { id: updated.id, status: updated.status };
}

export async function adminCreateSchedule(
  actorUserId: string,
  roomId: string,
  input: z.infer<typeof createScheduleSchema>
) {
  const room = await prisma.room.findFirst({ where: { id: roomId, status: "active" } });
  if (!room) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Sala no encontrada o inactiva");
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (endsAt <= startsAt) {
    throw new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "El fin debe ser posterior al inicio");
  }

  const schedule = await prisma.roomSchedule.create({
    data: { roomId, startsAt, endsAt, quota: input.quota }
  });

  await recordAudit({
    actorUserId,
    action: "schedules.created",
    entity: "RoomSchedule",
    entityId: schedule.id,
    metadata: { roomId, startsAt: startsAt.toISOString() }
  });

  return schedule;
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export async function adminListPromotions(input: { page: number; limit: number }) {
  const skip = (input.page - 1) * input.limit;

  const [items, total] = await Promise.all([
    prisma.promotion.findMany({
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true } },
        membershipPlan: { select: { id: true, name: true } }
      }
    }),
    prisma.promotion.count()
  ]);

  return {
    items: items.map((p) => ({ ...p, discountPercent: Number(p.discountPercent) })),
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.ceil(total / input.limit)
  };
}

export async function adminCreatePromotion(
  actorUserId: string,
  input: z.infer<typeof createPromotionSchema>
) {
  if (input.targetType === PromotionTargetType.product && !input.productId) {
    throw new AppError(
      httpStatus.badRequest,
      "VALIDATION_ERROR",
      "Debes indicar el producto objetivo"
    );
  }

  if (input.targetType === PromotionTargetType.membership_plan && !input.membershipPlanId) {
    throw new AppError(
      httpStatus.badRequest,
      "VALIDATION_ERROR",
      "Debes indicar el plan de membresia objetivo"
    );
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (endsAt <= startsAt) {
    throw new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "El fin debe ser posterior al inicio");
  }

  const promotion = await prisma.promotion.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      discountPercent: input.discountPercent,
      targetType: input.targetType,
      ...(input.productId ? { productId: input.productId } : {}),
      ...(input.membershipPlanId ? { membershipPlanId: input.membershipPlanId } : {}),
      startsAt,
      endsAt
    }
  });

  await recordAudit({
    actorUserId,
    action: "promotions.created",
    entity: "Promotion",
    entityId: promotion.id,
    metadata: { name: promotion.name }
  });

  return { ...promotion, discountPercent: Number(promotion.discountPercent) };
}

export async function adminUpdatePromotion(
  actorUserId: string,
  promotionId: string,
  input: z.infer<typeof updatePromotionSchema>
) {
  const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promotion) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Promocion no encontrada");
  }

  const updated = await prisma.promotion.update({
    where: { id: promotionId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.discountPercent !== undefined ? { discountPercent: input.discountPercent } : {}),
      ...(input.targetType ? { targetType: input.targetType } : {}),
      ...(input.productId !== undefined ? { productId: input.productId } : {}),
      ...(input.membershipPlanId !== undefined ? { membershipPlanId: input.membershipPlanId } : {}),
      ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}),
      ...(input.endsAt ? { endsAt: new Date(input.endsAt) } : {})
    }
  });

  await recordAudit({
    actorUserId,
    action: "promotions.updated",
    entity: "Promotion",
    entityId: promotionId,
    metadata: input
  });

  return { ...updated, discountPercent: Number(updated.discountPercent) };
}

export async function adminTogglePromotionStatus(actorUserId: string, promotionId: string) {
  const promotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!promotion) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Promocion no encontrada");
  }

  const nextStatus: EntityStatus =
    promotion.status === EntityStatus.active ? EntityStatus.inactive : EntityStatus.active;

  const updated = await prisma.promotion.update({
    where: { id: promotionId },
    data: { status: nextStatus }
  });

  await recordAudit({
    actorUserId,
    action: "promotions.status.changed",
    entity: "Promotion",
    entityId: promotionId,
    metadata: { from: promotion.status, to: nextStatus }
  });

  return { id: updated.id, status: updated.status };
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function adminListCategories() {
  return prisma.productCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } }
  });
}

// ─── Audit logs ──────────────────────────────────────────────────────────────

export async function listAuditLogs(input: z.infer<typeof auditLogQuerySchema>) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.AuditLogWhereInput = {
    ...(input.entity ? { entity: input.entity } : {}),
    ...(input.actorUserId ? { actorUserId: input.actorUserId } : {})
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    items,
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.ceil(total / input.limit)
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base}-${Date.now()}`;
}
