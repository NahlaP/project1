// backend/routes/domain.routes.ts
import { Router } from "express";
import { getDomainInfo } from "../controllers/domain.controller";
// If you want auth, import your requireAuth and wrap the route:
import { requireAuth } from "../middleware/auth.middleware";;

const r = Router();

// Currently public; you can add requireAuth if needed:
r.get("/me", requireAuth, getDomainInfo);


export default r;
