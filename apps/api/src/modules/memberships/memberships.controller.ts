import type { RequestHandler } from "express";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import {
  getMyMembership,
  listMembershipPlans,
  purchaseMembership,
  purchaseMembershipSchema,
  renewMembership
} from "./memberships.service.js";

export const customerOnly = authorizeRole(["Cliente"]);

export const listMembershipPlansController: RequestHandler = async (_request, response, next) => {
  try {
    const plans = await listMembershipPlans();
    return sendSuccess(response, httpStatus.ok, plans, "Planes listados");
  } catch (error) {
    return next(error);
  }
};

export const purchaseMembershipController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const payload = purchaseMembershipSchema.parse(request.body);
    const result = await purchaseMembership({
      userId: request.user.id,
      membershipPlanId: payload.membershipPlanId,
      paymentMethod: payload.paymentMethod
    });

    return sendSuccess(response, httpStatus.created, result, "Membresia comprada");
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", [error]));
    }

    return next(error);
  }
};

export const renewMembershipController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const payload = purchaseMembershipSchema.parse(request.body);
    const result = await renewMembership({
      userId: request.user.id,
      membershipPlanId: payload.membershipPlanId,
      paymentMethod: payload.paymentMethod
    });

    return sendSuccess(response, httpStatus.created, result, "Membresia renovada");
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", [error]));
    }

    return next(error);
  }
};

export const getMyMembershipController: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user) {
      throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no autenticado");
    }

    const membership = await getMyMembership(request.user.id);

    return sendSuccess(response, httpStatus.ok, membership, "Membresia actual");
  } catch (error) {
    return next(error);
  }
};
