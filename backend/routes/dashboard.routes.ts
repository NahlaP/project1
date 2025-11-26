import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getCurrentSubscriptionWidget,
  getMyProductsWidget,
} from "../controllers/dashboard.controller";

const router = Router();

router.use(requireAuth);

router.get("/current-subscription", getCurrentSubscriptionWidget);
router.get("/my-products", getMyProductsWidget);

export default router;
