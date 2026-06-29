import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import { parseUuidParam, requireUser } from "../../utils/controller.js";
import {
  adminCreateMembershipPlan,
  adminCreateProduct,
  adminCreatePromotion,
  adminCreateRoom,
  adminCreateSchedule,
  adminListCategories,
  adminListMembershipPlans,
  adminListProducts,
  adminListPromotions,
  adminListRooms,
  adminTogglePlanStatus,
  adminToggleProductStatus,
  adminTogglePromotionStatus,
  adminToggleRoomStatus,
  adminUpdateMembershipPlan,
  adminUpdateProduct,
  adminUpdatePromotion,
  adminUpdateRoom,
  auditLogQuerySchema,
  createMembershipPlanSchema,
  createProductSchema,
  createPromotionSchema,
  createRoomSchema,
  createScheduleSchema,
  listAuditLogs,
  updateMembershipPlanSchema,
  updateProductSchema,
  updatePromotionSchema,
  updateRoomSchema
} from "./admin.service.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional()
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const listProductsAdminController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = paginationSchema.safeParse(request.query);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Parametros invalidos"));

    const result = await adminListProducts({
      page: parsed.data.page,
      limit: parsed.data.limit,
      ...(parsed.data.search ? { search: parsed.data.search } : {})
    });

    return sendSuccess(response, httpStatus.ok, result, "Productos");
  } catch (error) { return next(error); }
};

export const createProductAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = createProductSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const product = await adminCreateProduct(user.id, parsed.data);
    return sendSuccess(response, httpStatus.created, product, "Producto creado");
  } catch (error) { return next(error); }
};

export const updateProductAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const productId = parseUuidParam(request.params.productId, "ID de producto");
    const parsed = updateProductSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const product = await adminUpdateProduct(user.id, productId, parsed.data);
    return sendSuccess(response, httpStatus.ok, product, "Producto actualizado");
  } catch (error) { return next(error); }
};

export const toggleProductStatusController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const productId = parseUuidParam(request.params.productId, "ID de producto");
    const result = await adminToggleProductStatus(user.id, productId);
    return sendSuccess(response, httpStatus.ok, result, "Estado actualizado");
  } catch (error) { return next(error); }
};

// ─── Membership plans ─────────────────────────────────────────────────────────

export const listPlansAdminController: RequestHandler = async (_request, response, next) => {
  try {
    const plans = await adminListMembershipPlans();
    return sendSuccess(response, httpStatus.ok, plans, "Planes");
  } catch (error) { return next(error); }
};

export const createPlanAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = createMembershipPlanSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const plan = await adminCreateMembershipPlan(user.id, parsed.data);
    return sendSuccess(response, httpStatus.created, plan, "Plan creado");
  } catch (error) { return next(error); }
};

export const updatePlanAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const planId = parseUuidParam(request.params.planId, "ID de plan");
    const parsed = updateMembershipPlanSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const plan = await adminUpdateMembershipPlan(user.id, planId, parsed.data);
    return sendSuccess(response, httpStatus.ok, plan, "Plan actualizado");
  } catch (error) { return next(error); }
};

export const togglePlanStatusController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const planId = parseUuidParam(request.params.planId, "ID de plan");
    const result = await adminTogglePlanStatus(user.id, planId);
    return sendSuccess(response, httpStatus.ok, result, "Estado actualizado");
  } catch (error) { return next(error); }
};

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const listRoomsAdminController: RequestHandler = async (_request, response, next) => {
  try {
    const rooms = await adminListRooms();
    return sendSuccess(response, httpStatus.ok, rooms, "Salas");
  } catch (error) { return next(error); }
};

export const createRoomAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = createRoomSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const room = await adminCreateRoom(user.id, parsed.data);
    return sendSuccess(response, httpStatus.created, room, "Sala creada");
  } catch (error) { return next(error); }
};

export const updateRoomAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const roomId = parseUuidParam(request.params.roomId, "ID de sala");
    const parsed = updateRoomSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const room = await adminUpdateRoom(user.id, roomId, parsed.data);
    return sendSuccess(response, httpStatus.ok, room, "Sala actualizada");
  } catch (error) { return next(error); }
};

export const toggleRoomStatusController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const roomId = parseUuidParam(request.params.roomId, "ID de sala");
    const result = await adminToggleRoomStatus(user.id, roomId);
    return sendSuccess(response, httpStatus.ok, result, "Estado actualizado");
  } catch (error) { return next(error); }
};

export const createScheduleAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const roomId = parseUuidParam(request.params.roomId, "ID de sala");
    const parsed = createScheduleSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const schedule = await adminCreateSchedule(user.id, roomId, parsed.data);
    return sendSuccess(response, httpStatus.created, schedule, "Horario creado");
  } catch (error) { return next(error); }
};

// ─── Promotions ──────────────────────────────────────────────────────────────

export const listPromotionsAdminController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = paginationSchema.safeParse(request.query);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Parametros invalidos"));

    const result = await adminListPromotions({ page: parsed.data.page, limit: parsed.data.limit });
    return sendSuccess(response, httpStatus.ok, result, "Promociones");
  } catch (error) { return next(error); }
};

export const createPromotionAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = createPromotionSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const promotion = await adminCreatePromotion(user.id, parsed.data);
    return sendSuccess(response, httpStatus.created, promotion, "Promocion creada");
  } catch (error) { return next(error); }
};

export const updatePromotionAdminController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const promotionId = parseUuidParam(request.params.promotionId, "ID de promocion");
    const parsed = updatePromotionSchema.safeParse(request.body);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues));

    const promotion = await adminUpdatePromotion(user.id, promotionId, parsed.data);
    return sendSuccess(response, httpStatus.ok, promotion, "Promocion actualizada");
  } catch (error) { return next(error); }
};

export const togglePromotionStatusController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const promotionId = parseUuidParam(request.params.promotionId, "ID de promocion");
    const result = await adminTogglePromotionStatus(user.id, promotionId);
    return sendSuccess(response, httpStatus.ok, result, "Estado actualizado");
  } catch (error) { return next(error); }
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const listCategoriesAdminController: RequestHandler = async (_request, response, next) => {
  try {
    const categories = await adminListCategories();
    return sendSuccess(response, httpStatus.ok, categories, "Categorias");
  } catch (error) { return next(error); }
};

// ─── Audit ────────────────────────────────────────────────────────────────────

export const listAuditLogsController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = auditLogQuerySchema.safeParse(request.query);
    if (!parsed.success) return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Parametros invalidos"));

    const result = await listAuditLogs(parsed.data);
    return sendSuccess(response, httpStatus.ok, result, "Registros de auditoria");
  } catch (error) { return next(error); }
};
