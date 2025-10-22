// import express from "express";
// import * as marquee from "../controllers/marquee.controller";

// const router = express.Router();

// // GET /api/marquee/:userId/:templateId
// router.get("/:userId/:templateId", marquee.getMarquee);

// // PUT /api/marquee/:userId/:templateId
// router.put("/:userId/:templateId", marquee.upsertMarquee);

// export default router;













import express from "express";
import * as marquee from "../controllers/marquee.controller";

const router = express.Router();

// GET /api/marquee/:userId/:templateId
router.get("/:userId/:templateId", marquee.getMarquee);

// PUT /api/marquee/:userId/:templateId
router.put("/:userId/:templateId", marquee.upsertMarquee);

// POST /api/marquee/:userId/:templateId/reset
router.post("/:userId/:templateId/reset", marquee.resetMarquee);

export default router;
