
// import express from "express";
// import multer from "multer";
// import path from "path";
// import {
//   getTopbar,
//   updateTopbar,
//   uploadLogo,
//   deleteLogo,
// } from "../controllers/topbar.controller";

// const router = express.Router();

// // -------- Multer config --------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.resolve("uploads/topbar"));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname); // .png, .jpg...
//     cb(null, `${Date.now()}-${file.fieldname}${ext}`);
//   },
// });
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// // -------- Routes --------
// router.get("/:userId/:templateId", getTopbar);
// router.put("/:userId/:templateId", updateTopbar);

// // image logo upload
// router.post(
//   "/:userId/:templateId/logo",
//   upload.single("logo"),
//   uploadLogo
// );

// router.delete("/:userId/:templateId/logo", deleteLogo);

// export default router;



// routes/topbar.routes.ts
import express from "express";
import { upload } from "../middleware/upload";
import {
  getTopbar,
  updateTopbar,
  uploadLogo,
  deleteLogo,
} from "../controllers/topbar.controller";

const router = express.Router();

router.get("/:userId/:templateId", getTopbar);
router.put("/:userId/:templateId", updateTopbar);

// S3 upload → s3://.../sections/topbar/...
router.post(
  "/:userId/:templateId/logo",
  (req, _res, next) => {
    req.params.folder = "sections/topbar";
    next();
  },
  upload.single("logo"),
  uploadLogo
);

router.delete("/:userId/:templateId/logo", deleteLogo);

export default router;
