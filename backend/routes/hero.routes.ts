
// // og

// import express from "express";
// import * as hero from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// /** attach folder for hero uploads; your upload middleware reads req.params.folder */
// const heroUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/hero" };
//   return upload.single("image")(req, res, next);
// };

// // pick a valid handler (handles any naming drift)
// const upsertHandler =
//   (hero as any).upsertHero || (hero as any).updateHero || (hero as any).saveHero;

// /** --- REST-style routes --- */
// router.get("/:userId/:templateId", hero.getHero);
// router.put("/:userId/:templateId", upsertHandler);
// router.post("/:userId/:templateId/image", heroUpload, hero.uploadHeroImage);
// router.post("/:userId/:templateId/generate", hero.generateHero);
// router.post("/:userId/:templateId/clear-image", hero.clearHeroImage);

// /** --- Legacy compatibility for your current UI --- */
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/upload-image", setDefaults, heroUpload, hero.uploadHeroImage);
// router.post("/save", setDefaults, upsertHandler);

// export default router;







// routes/hero.routes.ts
import express from "express";
import * as hero from "../controllers/hero.controller";

const router = express.Router();

/** --- REST-style routes (NO S3, NO multer) --- */
router.get("/:userId/:templateId", hero.getHero);
router.put("/:userId/:templateId", hero.upsertHero);
router.post("/:userId/:templateId/generate", hero.generateHero);
router.post("/:userId/:templateId/clear-image", hero.clearHeroImage);
router.post("/:userId/:templateId/upload-token", hero.getHeroUploadToken);

/** --- Legacy compatibility for your current UI (optional defaults) --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/save", setDefaults, hero.upsertHero);

export default router;
