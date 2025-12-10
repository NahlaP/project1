// backend/routes/domaintransfer.routes.ts
import { Router } from "express";
import { saveTransferDomain } from "../controllers/domaintransfer.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

// ✅ Protected route (same pattern as /me)
r.post("/transfer", requireAuth, saveTransferDomain);

export default r;
