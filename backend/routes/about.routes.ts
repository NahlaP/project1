// // backend/routes/about.routes.ts
// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// import {
//   getAbout,
//   upsertAbout,
//   uploadAboutImage,
//   deleteAboutImage,
// } from "../controllers/about.controller";

// const router = express.Router();

// // ensure folder
// const uploadDir = path.resolve("uploads/about");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => cb(null, uploadDir),
//   filename: (_, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-about${ext}`);
//   },
// });
// const upload = multer({ storage });

// // CRUD
// router.get("/:userId/:templateId", getAbout);
// router.put("/:userId/:templateId", upsertAbout);

// // image
// router.post("/:userId/:templateId/image", upload.single("image"), uploadAboutImage);
// router.delete("/:userId/:templateId/image", deleteAboutImage);

// export default router;


// backend/routes/about.routes.ts
import express from "express";
import {
  getAbout,
  upsertAbout,
  uploadAboutImage,
  deleteAboutImage,
} from "../controllers/about.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// ✅ Save uploads under sections/about/
const aboutUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/about" };
  return upload.single("image")(req, res, next);
};

// CRUD
router.get("/:userId/:templateId", getAbout);
router.put("/:userId/:templateId", upsertAbout);

// image
router.post("/:userId/:templateId/image", aboutUpload, uploadAboutImage);
router.delete("/:userId/:templateId/image", deleteAboutImage);

export default router;
