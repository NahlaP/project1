// backend/routes/changeauth.routes.ts

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

import {
  updateProfile,
  changeEmail,
  changePassword,
} from "../controllers/changeauth.controller";

const r = Router();

/* -----------------------------------------
 * ACCOUNT SETTINGS ROUTES
 * ----------------------------------------- */

// Update fullName, company, country
r.patch("/profile", requireAuth, updateProfile);

// Change email (requires current password)
r.post("/change-email", requireAuth, changeEmail);

// Change password (requires current password)
r.post("/change-password", requireAuth, changePassword);

export default r;
