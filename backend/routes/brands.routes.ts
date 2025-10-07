// // backend/routes/brands.routes.ts
// import express from "express";
// import * as brands from "../controllers/brands.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// const brandUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/brands" };
//   return upload.single("image")(req, res, next);
// };

// router.get("/:userId/:templateId", brands.getBrands);
// router.put("/:userId/:templateId", brands.upsertBrands);
// router.post("/:userId/:templateId/image/:index", brandUpload, brands.uploadBrandImage);
// router.delete("/:userId/:templateId/image/:index", brands.deleteBrandImage);

// export default router;



// og
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

// set upload folder and use single-file field name "image"
const brandUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/brands" };
  return upload.single("image")(req, res, next);
};

router.get("/:userId/:templateId", brands.getBrands);
router.put("/:userId/:templateId", brands.upsertBrands);
router.post("/:userId/:templateId/image/:index", brandUpload, brands.uploadBrandImage);
router.delete("/:userId/:templateId/image/:index", brands.deleteBrandImage);

export default router;
