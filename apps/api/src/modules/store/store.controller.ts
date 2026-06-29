import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { httpStatus } from "../../utils/http-status.js";
import { parseUuidParam, requireUser } from "../../utils/controller.js";
import {
  addCartItem,
  addCartItemSchema,
  checkout,
  checkoutSchema,
  getCart,
  listMyOrders,
  listMyPayments,
  listProducts,
  removeCartItem,
  updateCartItem,
  updateCartItemSchema
} from "./store.service.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional()
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const listProductsController: RequestHandler = async (request, response, next) => {
  try {
    const parsed = paginationSchema.safeParse(request.query);

    if (!parsed.success) {
      return next(new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Parametros invalidos"));
    }

    const result = await listProducts({
      page: parsed.data.page,
      limit: parsed.data.limit,
      ...(parsed.data.search ? { search: parsed.data.search } : {})
    });
    return sendSuccess(response, httpStatus.ok, result, "Productos disponibles");
  } catch (error) {
    return next(error);
  }
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCartController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const cart = await getCart(user.id);
    return sendSuccess(response, httpStatus.ok, cart, "Carrito actual");
  } catch (error) {
    return next(error);
  }
};

export const addCartItemController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = addCartItemSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const item = await addCartItem({
      userId: user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity
    });

    return sendSuccess(response, httpStatus.created, item, "Item agregado al carrito");
  } catch (error) {
    return next(error);
  }
};

export const updateCartItemController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const cartItemId = parseUuidParam(request.params.cartItemId, "ID de item");
    const parsed = updateCartItemSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const item = await updateCartItem({
      userId: user.id,
      cartItemId,
      quantity: parsed.data.quantity
    });

    return sendSuccess(response, httpStatus.ok, item, "Item actualizado");
  } catch (error) {
    return next(error);
  }
};

export const removeCartItemController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const cartItemId = parseUuidParam(request.params.cartItemId, "ID de item");

    await removeCartItem({ userId: user.id, cartItemId });

    return response.status(httpStatus.noContent).send();
  } catch (error) {
    return next(error);
  }
};

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const checkoutController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const parsed = checkoutSchema.safeParse(request.body);

    if (!parsed.success) {
      return next(
        new AppError(httpStatus.badRequest, "VALIDATION_ERROR", "Datos invalidos", parsed.error.issues)
      );
    }

    const result = await checkout({
      userId: user.id,
      paymentMethod: parsed.data.paymentMethod
    });

    return sendSuccess(response, httpStatus.created, result, "Compra confirmada");
  } catch (error) {
    return next(error);
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const listMyOrdersController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const orders = await listMyOrders(user.id);
    return sendSuccess(response, httpStatus.ok, orders, "Mis ordenes");
  } catch (error) {
    return next(error);
  }
};

// ─── Payments ────────────────────────────────────────────────────────────────

export const listMyPaymentsController: RequestHandler = async (request, response, next) => {
  try {
    const user = requireUser(request);
    const payments = await listMyPayments(user.id);
    return sendSuccess(response, httpStatus.ok, payments, "Mis pagos");
  } catch (error) {
    return next(error);
  }
};
