import express from "express";
import { generateHero, saveHero, getHero, uploadHeroImage ,clearHeroImage} from "../controllers/hero.controller";
import { upload } from "../middleware/upload";
const router = express.Router();

router.get("/:userId/:templateId", getHero); 
router.post("/save", saveHero);
router.post("/generate", generateHero);
 router.post("/upload-image", upload.single("image"), uploadHeroImage); // ✅ NEW ROUTE 
router.post("/clear-image", clearHeroImage);

export default router;
