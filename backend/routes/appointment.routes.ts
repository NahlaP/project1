// routes/appointment.routes.ts
import express from "express";
import { getAppointmentSection, updateAppointmentSection } from "../controllers/appointment.controller";
const router = express.Router();

router.get("/:userId/:templateId", getAppointmentSection);
router.put("/:userId/:templateId", updateAppointmentSection);

export default router;
