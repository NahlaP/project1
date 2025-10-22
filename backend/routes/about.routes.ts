

// og

// import express from "express";
// import * as about from "../controllers/about.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // Save uploads under sections/about/
// const aboutUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/about" };
//   return upload.single("image")(req, res, next);
// };

// // REST-style
// router.get("/:userId/:templateId", about.getAbout);
// router.put("/:userId/:templateId", about.upsertAbout);
// router.post("/:userId/:templateId/reset", about.resetAbout);

// // image (multipart & base64)
// router.post("/:userId/:templateId/image", aboutUpload, about.uploadAboutImage);
// router.post("/:userId/:templateId/image-base64", about.uploadAboutImageBase64);

// // image management
// router.post("/:userId/:templateId/clear-image", about.clearAboutImage);
// router.delete("/:userId/:templateId/image", about.deleteAboutImage);

// // Legacy convenience (optional)
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/upload-image", setDefaults, aboutUpload, about.uploadAboutImage);
// router.post("/save", setDefaults, about.upsertAbout);

// export default router;















import express from "express";
import * as about from "../controllers/about.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// Save uploads under sections/about/
const aboutUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/about" };
  return upload.single("image")(req, res, next);
};

// REST
router.get("/:userId/:templateId", about.getAbout);
router.put("/:userId/:templateId", about.upsertAbout);
router.post("/:userId/:templateId/reset", about.resetAbout);

// image (multipart & base64)
router.post("/:userId/:templateId/image", aboutUpload, about.uploadAboutImage);
router.post("/:userId/:templateId/image-base64", about.uploadAboutImageBase64);

// image management
router.post("/:userId/:templateId/clear-image", about.clearAboutImage);
router.delete("/:userId/:templateId/image", about.deleteAboutImage);

// Legacy convenience (optional)
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/upload-image", setDefaults, aboutUpload, about.uploadAboutImage);
router.post("/save", setDefaults, about.upsertAbout);

export default router;
