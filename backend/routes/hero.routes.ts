
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








// import express from "express";
// import * as hero from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// /** Legacy GET with query (?userId=&templateId=) to support older dashboard calls */
// router.get("/", async (req: any, res, next) => {
//   try {
//     req.params = req.params || {};
//     req.params.userId = req.query.userId || req.params.userId || "demo-user";
//     req.params.templateId = req.query.templateId || req.params.templateId || "gym-template-1";
//     return (await import("../controllers/hero.controller")).getHero(req, res);
//   } catch (e) { next(e); }
// });

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
// router.post("/:userId/:templateId/image-base64", hero.uploadHeroImageBase64); // optional JSON upload
// router.post("/:userId/:templateId/generate", hero.generateHero);
// router.post("/:userId/:templateId/clear-image", hero.clearHeroImage);
// router.post("/:userId/:templateId/reset", hero.resetHero); // reset to default

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















// video url

import express from "express";
import * as hero from "../controllers/hero.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

/** Legacy GET with query (?userId=&templateId=) */
router.get("/", async (req: any, res, next) => {
  try {
    req.params = req.params || {};
    req.params.userId = req.query.userId || req.params.userId || "demo-user";
    req.params.templateId = req.query.templateId || req.params.templateId || "gym-template-1";
    return (await import("../controllers/hero.controller")).getHero(req, res);
  } catch (e) { next(e); }
});

/** set folder for each upload type */
const heroImageUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/hero/images" };
  return upload.single("image")(req, res, next);
};
const heroVideoUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/hero/videos" };
  return upload.single("video")(req, res, next);
};
const heroPosterUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/hero/posters" };
  return upload.single("poster")(req, res, next);
};

const upsertHandler =
  (hero as any).upsertHero || (hero as any).updateHero || (hero as any).saveHero;

/** --- REST-style routes --- */
router.get("/:userId/:templateId", hero.getHero);
router.put("/:userId/:templateId", upsertHandler);

router.post("/:userId/:templateId/image",  heroImageUpload,  hero.uploadHeroImage);
router.post("/:userId/:templateId/video",  heroVideoUpload,  hero.uploadHeroVideo);
router.post("/:userId/:templateId/poster", heroPosterUpload, hero.uploadHeroPoster);

router.post("/:userId/:templateId/clear-image", hero.clearHeroImage);
router.post("/:userId/:templateId/clear-video", hero.clearHeroVideo);

router.post("/:userId/:templateId/generate", hero.generateHero);
// router.post("/:userId/:templateId/reset",    hero.resetHero);

/** --- Legacy compatibility --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/upload-image", setDefaults, heroImageUpload, hero.uploadHeroImage);
router.post("/save", setDefaults, upsertHandler);

export default router;
