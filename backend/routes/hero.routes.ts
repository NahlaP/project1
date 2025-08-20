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
// import express from "express";
// import {
//   generateHero,
//   saveHero,
//   getHero,
//   uploadHeroImage,
//   clearHeroImage,
// } from "../controllers/hero.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// /** Make multer-s3 save under a fixed folder for the Hero section */
// const heroUpload = (req: any, res: any, next: any) => {
//   // change to "sectionsupload/hero" if you prefer that path
//   req.params = { ...(req.params || {}), folder: "sections/hero" };
//   return upload.single("image")(req, res, next);
// };

// router.get("/:userId/:templateId", getHero);
// router.post("/save", saveHero);
// router.post("/generate", generateHero);

// // ✅ files go to s3://<bucket>/sections/hero/<filename>
// router.post("/upload-image", heroUpload, uploadHeroImage);

// router.post("/clear-image", clearHeroImage);

// export default router;





// routes/hero.routes.ts
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
