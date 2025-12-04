import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { trackVisitor, getVisitorStats } from "../controllers/visitor.controller";

const router = Router();

router.post("/track", trackVisitor);    // public for S3 site
router.get("/stats", requireAuth, getVisitorStats); // dashboard only

export default router;

