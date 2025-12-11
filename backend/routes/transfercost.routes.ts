// backend/routes/transfercost.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getTransferCostController } from "../controllers/transferCost.controller";

const r = Router();

/**
 * GET /api/domain/transfer-cost?tld=com
 * Returns original ResellerClub transfer cost for the given TLD
 */
r.get("/transfer-cost", requireAuth, getTransferCostController);

module.exports = r;
