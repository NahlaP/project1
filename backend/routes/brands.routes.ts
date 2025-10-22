// // og

// import express from "express";
// import * as brands from "../controllers/brands.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // set upload folder and use single-file field name "image"
// const brandUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/brands" };
//   return upload.single("image")(req, res, next);
// };

// router.get("/:userId/:templateId", brands.getBrands);
// router.put("/:userId/:templateId", brands.upsertBrands);
// router.post("/:userId/:templateId/image/:index", brandUpload, brands.uploadBrandImage);
// router.delete("/:userId/:templateId/image/:index", brands.deleteBrandImage);

// export default router;















import express from "express";
import * as brands from "../controllers/brands.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// Keep uploads under sections/brands/  (same pattern as projects.routes.ts)
const brandUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/brands" };
  return upload.single("image")(req, res, next);
};

// REST
router.get("/:userId/:templateId", brands.getBrands);
router.put("/:userId/:templateId", brands.upsertBrands);

// RESET to template defaults
router.post("/:userId/:templateId/reset", brands.resetBrands);

// Image per brand index
router.post("/:userId/:templateId/image/:index", brandUpload, brands.uploadBrandImage);
router.delete("/:userId/:templateId/image/:index", brands.deleteBrandImage);

// CommonJS-style export to match your projects.routes.ts
export = router;
