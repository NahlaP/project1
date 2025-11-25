


// import express from "express";
// import * as appointment from "../controllers/appointment.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// /** Save uploads under S3 folder: sections/appointment */
// const appointmentUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/appointment" };
//   return upload.single("image")(req, res, next);
// };

// // Text/data
// router.get("/:userId/:templateId", appointment.getAppointmentSection);
// router.put("/:userId/:templateId", appointment.updateAppointmentSection);

// // Images
// router.post("/:userId/:templateId/image", appointmentUpload, appointment.uploadAppointmentBg);
// router.post("/:userId/:templateId/image-base64", appointment.uploadAppointmentBgBase64);
// router.post("/:userId/:templateId/clear-image", appointment.clearAppointmentBg);

// export default router;



import express from "express";
import * as appointment from "../controllers/appointment.controller";

// ✅ use uploadImage instead of upload.single("image")
import { upload, uploadImage } from "../middleware/upload";

const router = express.Router();

/** Save uploads under S3 folder: sections/appointment */
const appointmentUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/appointment" };

  // BEFORE:
  // return upload.single("image")(req, res, next);

  // AFTER (auto save to Media collection)
  return uploadImage(req, res, next);
};

// Text/data
router.get("/:userId/:templateId", appointment.getAppointmentSection);
router.put("/:userId/:templateId", appointment.updateAppointmentSection);

// Images
router.post("/:userId/:templateId/image", appointmentUpload, appointment.uploadAppointmentBg);
router.post("/:userId/:templateId/image-base64", appointment.uploadAppointmentBgBase64);
router.post("/:userId/:templateId/clear-image", appointment.clearAppointmentBg);

export default router;
