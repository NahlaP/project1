// backend/routes/visitor.routes.ts
import { Router } from "express";
import {
  trackVisitor,
  visitorsSummary,
} from "../controllers/visitor.controller";

const r = Router();

// POST /api/visitors/track
r.post("/track", trackVisitor);

// GET /api/visitors/summary?appUserId=...&templateId=...
r.get("/summary", visitorsSummary);

export default r;
