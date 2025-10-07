import express from "express";
import * as marquee from "../controllers/marquee.controller";

const router = express.Router();

// GET /api/marquee/:userId/:templateId
router.get("/:userId/:templateId", marquee.getMarquee);

// PUT /api/marquee/:userId/:templateId
router.put("/:userId/:templateId", marquee.upsertMarquee);

export default router;
