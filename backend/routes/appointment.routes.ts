


// // work with s3
// import express from "express";
// import {
//   getAppointmentSection,
//   updateAppointmentSection,
//   uploadAppointmentBg,
//   clearAppointmentBg,
// } from "../controllers/appointment.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// /** Force uploads under S3 folder: sections/appointment */
// const appointmentUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/appointment" };
//   return upload.single("image")(req, res, next);
// };

// // Original endpoints (kept):
// router.get("/:userId/:templateId", getAppointmentSection);
// router.put("/:userId/:templateId", updateAppointmentSection);

// // New minimal BG helpers:
// router.post("/upload-bg", appointmentUpload, uploadAppointmentBg);
// router.post("/clear-bg", clearAppointmentBg);

// export default router;





// backend/routes/appointment.routes.ts
import express from "express";
import {
  getAppointmentSection,
  updateAppointmentSection,
  clearAppointmentBg,
  getAppointmentUploadToken,
} from "../controllers/appointment.controller";

const router = express.Router();

/** --- REST-style routes (match hero: NO S3, NO multer) --- */
router.get("/:userId/:templateId", getAppointmentSection);
router.put("/:userId/:templateId", updateAppointmentSection);
router.post("/:userId/:templateId/clear-image", clearAppointmentBg);
router.post("/:userId/:templateId/upload-token", getAppointmentUploadToken);

/** --- Legacy compatibility for your current UI (optional defaults) --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/save", setDefaults, updateAppointmentSection);

export default router;
