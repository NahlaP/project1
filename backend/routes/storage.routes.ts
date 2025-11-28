// backend/routes/storage.routes.ts
import { Router, Request, Response } from "express";
import { getStorageSummary } from "../controllers/storage.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

// GET /api/storage/summary
r.get("/summary", requireAuth, getStorageSummary);

export default r;
