// // backend/routes/emailManager.routes.ts
// import { Router } from "express";
// import {
//   getEmailSummary,
// //   getEmailAccounts,
// //   getEmailLists,
// } from "../controllers/emailManager.controller";
// import { requireAuth } from "../middleware/auth.middleware";

// const r = Router();

// // All Email Manager endpoints are auth-protected
// r.get("/summary", requireAuth, getEmailSummary);
// // r.get("/accounts", requireAuth, getEmailAccounts);
// // r.get("/lists", requireAuth, getEmailLists);

// export default r;






// backend/routes/emailManager.routes.ts
import { Router } from "express";
import {
  getEmailSummary,
  getEmailAccounts,
  getEmailLists,
} from "../controllers/emailManager.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// 🔒 all routes here require auth, same style as dashboard.routes.ts
router.use(requireAuth);

router.get("/summary", getEmailSummary);
router.get("/accounts", getEmailAccounts);
router.get("/lists", getEmailLists);

export default router;













