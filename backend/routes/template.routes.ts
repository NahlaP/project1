

// backend/routes/template.routes.ts
import { Router } from "express";
import {
  listTemplates,
  upsertTemplate,
  selectTemplate,
  getUserSelectedTemplate,
} from "../controllers/template.controller";

const router = Router();

router.get("/", listTemplates);
router.post("/", upsertTemplate);
router.post("/:templateId/select", selectTemplate);
router.get("/user/:userId/selected", getUserSelectedTemplate);

// ⛔️ removed the reset route entirely

export default router;

















