


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




// // cpanel
// // backend/routes/about.routes.ts
// import express from "express";
// import * as about from "../controllers/about.controller";

// const router = express.Router();

// /** --- REST-style routes (match hero: NO S3, NO multer) --- */
// router.get("/:userId/:templateId", about.getAbout);
// router.put("/:userId/:templateId", about.upsertAbout);
// router.post("/:userId/:templateId/clear-image", about.clearAboutImage);
// router.post("/:userId/:templateId/upload-token", about.getAboutUploadToken);

// /** --- Legacy compatibility for your current UI (optional defaults) --- */
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/save", setDefaults, about.upsertAbout);

// export default router;
