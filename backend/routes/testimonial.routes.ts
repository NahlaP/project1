




// import express from "express";
// import { upload } from "../middleware/upload";
// import {
//   getTestimonials,
//   createTestimonial,
//   deleteTestimonial,
//   updateTestimonial,
// } from "../controllers/testimonial.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getTestimonials);

// // Create → s3://.../sections/testimonials/...
// router.post(
//   "/:userId/:templateId",
//   (req, _res, next) => {
//     req.params.folder = "sections/testimonials";
//     next();
//   },
//   upload.single("image"),
//   createTestimonial
// );

// // Update → s3://.../sections/testimonials/<id>/...
// router.patch(
//   "/:id",
//   (req, _res, next) => {
//     const { id } = req.params;
//     req.params.folder = `sections/testimonials/${id}`;
//     next();
//   },
//   upload.single("image"),
//   updateTestimonial
// );

// router.delete("/:id", deleteTestimonial);

// export default router;










import express from "express";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  clearTestimonialImage,
  getTestimonialUploadToken,
} from "../controllers/testimonial.controller";

const router = express.Router();

/** --- REST-style routes (NO S3, NO multer) --- */
router.get("/:userId/:templateId", getTestimonials);
router.post("/:userId/:templateId", createTestimonial);
router.patch("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

// Helpers (match hero-style)
router.post("/:userId/:templateId/upload-token", getTestimonialUploadToken);
router.post("/:id/clear-image", clearTestimonialImage);

/** --- Legacy compatibility for your current UI (optional defaults) --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/save", setDefaults, createTestimonial);

export default router;
