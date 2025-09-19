




import express from "express";
import {
  getWhyChooseUs,
  updateWhyChooseUs,
  uploadWhyChooseBg,
  deleteWhyChooseBg,
} from "../controllers/whyChooseUs.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// Save to s3://<bucket>/sections/whychoose/bg/...
const bgUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/whychoose/bg" };
  return upload.single("image")(req, res, next);
};

router.get("/:userId/:templateId", getWhyChooseUs);
router.put("/:userId/:templateId", updateWhyChooseUs);
router.post("/:userId/:templateId/bg", bgUpload, uploadWhyChooseBg);
router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

export default router;



// // c panel
// import express from "express";
// import {
//   getWhyChooseUs,
//   updateWhyChooseUs,
//   clearWhyChooseBg,
//   getWhyChooseUploadToken,
// } from "../controllers/whyChooseUs.controller";

// const router = express.Router();

// /** --- REST-style routes (NO S3, NO multer) --- */
// router.get("/:userId/:templateId", getWhyChooseUs);
// router.put("/:userId/:templateId", updateWhyChooseUs);
// router.post("/:userId/:templateId/clear-image", clearWhyChooseBg);
// router.post("/:userId/:templateId/upload-token", getWhyChooseUploadToken);

// /** --- Legacy compatibility for your current UI (optional defaults) --- */
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/save", setDefaults, updateWhyChooseUs);

// export default router;
