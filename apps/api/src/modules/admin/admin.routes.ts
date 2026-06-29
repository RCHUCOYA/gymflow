import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import {
  createPlanAdminController,
  createProductAdminController,
  createPromotionAdminController,
  createRoomAdminController,
  createScheduleAdminController,
  listAuditLogsController,
  listCategoriesAdminController,
  listPlansAdminController,
  listProductsAdminController,
  listPromotionsAdminController,
  listRoomsAdminController,
  togglePlanStatusController,
  toggleProductStatusController,
  togglePromotionStatusController,
  toggleRoomStatusController,
  updatePlanAdminController,
  updateProductAdminController,
  updatePromotionAdminController,
  updateRoomAdminController
} from "./admin.controller.js";

const adminOnly = authorizeRole(["Administrador"]);

export const adminRouter = Router();

// All admin routes require authentication + Administrador role
adminRouter.use(authenticate, adminOnly);

// Products
adminRouter.get("/admin/products", listProductsAdminController);
adminRouter.post("/admin/products", createProductAdminController);
adminRouter.patch("/admin/products/:productId", updateProductAdminController);
adminRouter.patch("/admin/products/:productId/status", toggleProductStatusController);

// Categories (read-only for now — RN-014 says only admin manages products)
adminRouter.get("/admin/categories", listCategoriesAdminController);

// Membership plans
adminRouter.get("/admin/membership-plans", listPlansAdminController);
adminRouter.post("/admin/membership-plans", createPlanAdminController);
adminRouter.patch("/admin/membership-plans/:planId", updatePlanAdminController);
adminRouter.patch("/admin/membership-plans/:planId/status", togglePlanStatusController);

// Rooms
adminRouter.get("/admin/rooms", listRoomsAdminController);
adminRouter.post("/admin/rooms", createRoomAdminController);
adminRouter.patch("/admin/rooms/:roomId", updateRoomAdminController);
adminRouter.patch("/admin/rooms/:roomId/status", toggleRoomStatusController);
adminRouter.post("/admin/rooms/:roomId/schedules", createScheduleAdminController);

// Promotions
adminRouter.get("/admin/promotions", listPromotionsAdminController);
adminRouter.post("/admin/promotions", createPromotionAdminController);
adminRouter.patch("/admin/promotions/:promotionId", updatePromotionAdminController);
adminRouter.patch("/admin/promotions/:promotionId/status", togglePromotionStatusController);

// Audit
adminRouter.get("/admin/audit-logs", listAuditLogsController);
