import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getServices,
  addService,
  updateService,
  upsertServices,
  uploadServiceImage,
  deleteServiceImage,
  deleteServiceById
} from "../controllers/service.controller";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.resolve("uploads/services");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-service${ext}`);
  },
});
const upload = multer({ storage });

// Routes
router.get("/:userId/:templateId", getServices); // GET all services
router.put("/:userId/:templateId", upsertServices); // Bulk replace services
router.post("/:userId/:templateId", addService); // Add one service
router.put("/:userId/:templateId/:serviceId", updateService); // Update one service
router.delete("/:userId/:templateId/:serviceId", deleteServiceById); // Delete one service

// Image upload/delete
router.post(
  "/:userId/:templateId/:serviceId/image",
  upload.single("image"),
  uploadServiceImage
);
router.delete("/:userId/:templateId/:serviceId/image", deleteServiceImage);

export default router;
