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






// // og
// // // routes/hero.routes.ts
// import express from "express";
// import { generateHero, upsertHero, getHero, uploadHeroImage, clearHeroImage } from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// const heroUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/hero" };
//   return upload.single("image")(req, res, next);
// };

// router.get("/:userId/:templateId", getHero);
// router.put("/:userId/:templateId", upsertHero);
// router.post("/:userId/:templateId/image", heroUpload, uploadHeroImage);
// router.post("/:userId/:templateId/generate", generateHero);
// router.post("/:userId/:templateId/clear-image", clearHeroImage);

// export default router;






import express from "express";
import {
  generateHero,
  upsertHero,
  getHero,
  uploadHeroImage,
  clearHeroImage,
} from "../controllers/hero.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

/** attach folder for hero uploads; your upload middleware reads req.params.folder */
const heroUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/hero" };
  return upload.single("image")(req, res, next);
};

/** --- New REST-style routes (recommended) --- */
router.get("/:userId/:templateId", getHero);
router.put("/:userId/:templateId", upsertHero);
router.post("/:userId/:templateId/image", heroUpload, uploadHeroImage);
router.post("/:userId/:templateId/generate", generateHero);
router.post("/:userId/:templateId/clear-image", clearHeroImage);

/** --- Legacy compatibility so your current frontend keeps working --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};

// old upload route used by your UI: POST /api/hero/upload-image
router.post("/upload-image", setDefaults, heroUpload, uploadHeroImage);

// old save route used by your UI: POST /api/hero/save
router.post("/save", setDefaults, upsertHero);

export default router;
