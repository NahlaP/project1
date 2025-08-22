// import express from "express";
// import { generateHero, saveHero, getHero, uploadHeroImage ,clearHeroImage} from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";
// const router = express.Router();

// router.get("/:userId/:templateId", getHero); 
// router.post("/save", saveHero);
// router.post("/generate", generateHero);
//  router.post("/upload-image", upload.single("image"), uploadHeroImage); // ✅ NEW ROUTE 
// router.post("/clear-image", clearHeroImage);

// export default router;






// og
// // routes/hero.routes.ts
import express from "express";
import { generateHero, upsertHero, getHero, uploadHeroImage, clearHeroImage } from "../controllers/hero.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

const heroUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/hero" };
  return upload.single("image")(req, res, next);
};

router.get("/:userId/:templateId", getHero);
router.put("/:userId/:templateId", upsertHero);
router.post("/:userId/:templateId/image", heroUpload, uploadHeroImage);
router.post("/:userId/:templateId/generate", generateHero);
router.post("/:userId/:templateId/clear-image", clearHeroImage);

export default router;




// // routes/hero.routes.ts
// import express from "express";
// import {
//   generateHero,
//   upsertHero,
//   getHero,
//   uploadHeroImage,
//   clearHeroImage,
// } from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // Always upload into this S3 prefix
// const heroUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/hero" };
//   return (upload.single("image") as any)(req, res, next);
// };

// router.get("/:userId/:templateId", getHero);
// router.put("/:userId/:templateId", upsertHero);

// // Param-style upload
// router.post(
//   "/:userId/:templateId/image",
//   heroUpload,
//   (req, res) => uploadHeroImage(req as any, res as any) // call with 2 args
// );

// router.post("/:userId/:templateId/generate", generateHero);
// router.post("/:userId/:templateId/clear-image", clearHeroImage);

// // Alias your UI calls today: /api/hero/upload-image
// router.post("/upload-image", heroUpload, (req, res) => {
//   const body = ((req as any).body || {}) as { userId?: string; templateId?: string };
//   (req as any).params = {
//     ...((req as any).params || {}),
//     userId: body.userId || "demo-user",
//     templateId: body.templateId || "gym-template-1",
//   };
//   return uploadHeroImage(req as any, res as any); // 2 args only
// });

// export default router;
