




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
import { upload } from "../middleware/upload";
import {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
  uploadTestimonialImageBase64,
} from "../controllers/testimonial.controller";

const router = express.Router();

/** Create → s3://.../sections/testimonials */
const createUpload = (req: any, _res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/testimonials" };
  return upload.single("image")(req, _res, next);
};

/** Update → s3://.../sections/testimonials/<id> */
const updateUpload = (req: any, _res: any, next: any) => {
  const { id } = req.params;
  req.params = { ...(req.params || {}), folder: `sections/testimonials/${id || "misc"}` };
  return upload.single("image")(req, _res, next);
};

// List
router.get("/:userId/:templateId", getTestimonials);

// Create (multipart image optional)
router.post("/:userId/:templateId", createUpload, createTestimonial);

// Update (multipart image optional)
router.patch("/:id", updateUpload, updateTestimonial);

// OPTIONAL: base64 image upload (JSON)
router.post("/:userId/:templateId/:id/image-base64", uploadTestimonialImageBase64);

// Delete
router.delete("/:id", deleteTestimonial);

export default router;
