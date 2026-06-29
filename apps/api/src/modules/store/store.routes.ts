import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorizeRole } from "../../middlewares/authorize-role.js";
import {
  addCartItemController,
  checkoutController,
  getCartController,
  listMyOrdersController,
  listMyPaymentsController,
  listProductsController,
  removeCartItemController,
  updateCartItemController
} from "./store.controller.js";

const customerOnly = authorizeRole(["Cliente"]);

export const storeRouter = Router();

// Public products
storeRouter.get("/products", listProductsController);

// Cart (requires auth + Cliente)
storeRouter.get("/cart", authenticate, customerOnly, getCartController);
storeRouter.post("/cart/items", authenticate, customerOnly, addCartItemController);
storeRouter.patch("/cart/items/:cartItemId", authenticate, customerOnly, updateCartItemController);
storeRouter.delete("/cart/items/:cartItemId", authenticate, customerOnly, removeCartItemController);

// Orders
storeRouter.post("/orders/checkout", authenticate, customerOnly, checkoutController);
storeRouter.get("/orders/me", authenticate, customerOnly, listMyOrdersController);

// Payments
storeRouter.get("/payments/me", authenticate, customerOnly, listMyPaymentsController);
