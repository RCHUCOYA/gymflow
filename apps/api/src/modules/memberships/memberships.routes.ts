import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  customerOnly,
  getMyMembershipController,
  listMembershipPlansController,
  purchaseMembershipController,
  renewMembershipController
} from "./memberships.controller.js";

export const membershipsRouter = Router();

membershipsRouter.get("/membership-plans", listMembershipPlansController);
membershipsRouter.post("/memberships/purchase", authenticate, customerOnly, purchaseMembershipController);
membershipsRouter.post("/memberships/renew", authenticate, customerOnly, renewMembershipController);
membershipsRouter.get("/memberships/me", authenticate, customerOnly, getMyMembershipController);
