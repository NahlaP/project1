
<<<<<<< HEAD
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
=======
// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import {
//   getWhyChooseUs,
//   updateWhyChooseUs,
//   uploadWhyChooseBg,
//   deleteWhyChooseBg,
// } from "../controllers/whyChooseUs.controller";

// const router = express.Router();

// // Make sure folder exists
// const uploadDir = path.resolve("uploads/whychoose");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => cb(null, uploadDir),
//   filename: (_, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-whychoose${ext}`);
//   },
// });
// const upload = multer({ storage });

// // GET / PUT
// router.get("/:userId/:templateId", getWhyChooseUs);
// router.put("/:userId/:templateId", updateWhyChooseUs);

// // 👇 NEW: upload & delete bg image
// router.post(
//   "/:userId/:templateId/bg",
//   upload.single("image"),
//   uploadWhyChooseBg
// );
// router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

// export default router;



import express from "express";
>>>>>>> origin/nahla-update
import {
  getWhyChooseUs,
  updateWhyChooseUs,
  uploadWhyChooseBg,
  deleteWhyChooseBg,
} from "../controllers/whyChooseUs.controller";
<<<<<<< HEAD

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
=======
import { upload } from "../middleware/upload";

const router = express.Router();

// Save to s3://<bucket>/sections/whychoose/bg/...
const bgUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/whychoose/bg" };
  return upload.single("image")(req, res, next);
};

router.get("/:userId/:templateId", getWhyChooseUs);
router.put("/:userId/:templateId", updateWhyChooseUs);
router.post("/:userId/:templateId/bg", bgUpload, uploadWhyChooseBg);
>>>>>>> origin/nahla-update
router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

export default router;
