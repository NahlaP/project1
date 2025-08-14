// // routes/appointment.routes.ts
// import express from "express";
// import { getAppointmentSection, updateAppointmentSection } from "../controllers/appointment.controller";
// const router = express.Router();

// router.get("/:userId/:templateId", getAppointmentSection);
// router.put("/:userId/:templateId", updateAppointmentSection);

// export default router;




import express from "express";
import {
  getAppointmentSection,
  updateAppointmentSection,
  uploadAppointmentBg,
  clearAppointmentBg,
} from "../controllers/appointment.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

/** Force uploads under S3 folder: sections/appointment */
const appointmentUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/appointment" };
  return upload.single("image")(req, res, next);
};

// Original endpoints (kept):
router.get("/:userId/:templateId", getAppointmentSection);
router.put("/:userId/:templateId", updateAppointmentSection);

// New minimal BG helpers:
router.post("/upload-bg", appointmentUpload, uploadAppointmentBg);
router.post("/clear-bg", clearAppointmentBg);

export default router;
