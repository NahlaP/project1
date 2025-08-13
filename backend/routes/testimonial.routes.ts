
// import express from "express";
// import { upload } from "../middleware/upload";
// import {
//   getTestimonials,
//   createTestimonial,
//   deleteTestimonial,
//   updateTestimonial,
// } from "../controllers/testimonial.controller";

// const router = express.Router();

// // GET all testimonials
// router.get("/:userId/:templateId", getTestimonials);

// // POST with upload directly (folder = testimonials)
// router.post(
//   "/:userId/:templateId",
//   (req, res, next) => {
//     req.params.folder = "testimonials";
//     next();
//   },
//   upload.single("image"),
//   createTestimonial
// );

// // PATCH - Edit testimonial by ID with optional image upload
// router.patch(
//   "/:id",
//   (req, res, next) => {
//     req.params.folder = "testimonials"; // ensure folder param for multer
//     next();
//   },
//   upload.single("image"),
//   updateTestimonial
// );

// // DELETE testimonial
// router.delete("/:id", deleteTestimonial);

// export default router;




import express from "express";
import { upload } from "../middleware/upload";
import {
  getTestimonials,
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "../controllers/testimonial.controller";

const router = express.Router();

router.get("/:userId/:templateId", getTestimonials);

// Create → s3://.../sections/testimonials/...
router.post(
  "/:userId/:templateId",
  (req, _res, next) => {
    req.params.folder = "sections/testimonials";
    next();
  },
  upload.single("image"),
  createTestimonial
);

// Update → s3://.../sections/testimonials/<id>/...
router.patch(
  "/:id",
  (req, _res, next) => {
    const { id } = req.params;
    req.params.folder = `sections/testimonials/${id}`;
    next();
  },
  upload.single("image"),
  updateTestimonial
);

router.delete("/:id", deleteTestimonial);

export default router;
