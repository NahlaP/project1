
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getWhyChooseUs,
  updateWhyChooseUs,
  uploadWhyChooseBg,
  deleteWhyChooseBg,
} from "../controllers/whyChooseUs.controller";

const router = express.Router();

// Make sure folder exists
const uploadDir = path.resolve("uploads/whychoose");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-whychoose${ext}`);
  },
});
const upload = multer({ storage });

// GET / PUT
router.get("/:userId/:templateId", getWhyChooseUs);
router.put("/:userId/:templateId", updateWhyChooseUs);

// 👇 NEW: upload & delete bg image
router.post(
  "/:userId/:templateId/bg",
  upload.single("image"),
  uploadWhyChooseBg
);
router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

export default router;
