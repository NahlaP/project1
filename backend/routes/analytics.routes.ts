// // backend/routes/analytics.routes.ts
// import { Router } from "express";
// import { trackVisit, getVisitSummary } from "../controllers/analytics.controller";
// // import { authMiddleware } from "../middleware/auth.middleware"; // optional

// const router = Router();

// // public tracking (you *can* add rate limiting later)
// router.post("/visit/:userId/:templateId", trackVisit);

// // protected summary (better to keep behind auth)
// router.get(
//   "/summary/:userId/:templateId",
//   // authMiddleware,  // if you want only logged in users
//   getVisitSummary
// );

// export default router;














// backend/routes/analytics.routes.ts
import { Router } from "express";
import {
  recordVisit,
  getVisitSummary,
} from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware"; // whatever you already use

const router = Router();

// public (from S3 via PHP proxy)
router.post("/visit/:userId/:templateId", recordVisit);

// auth required (dashboard)
router.get(
  "/summary/:userId/:templateId",
  requireAuth,
  getVisitSummary
);

export default router;
