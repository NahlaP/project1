// backend/routes/domaintransfer.routes.ts
import { Router } from "express";
import {
  submitDomainTransfer,
  saveDnsOnlyDomain,
} from "../controllers/domaintransfer.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

// POST /api/domain/transfer
r.post("/transfer", requireAuth, submitDomainTransfer);

// POST /api/domain/dns
r.post("/dns", requireAuth, saveDnsOnlyDomain);

export default r;
