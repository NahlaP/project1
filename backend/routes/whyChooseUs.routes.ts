




// import express from "express";
// import {
//   getWhyChooseUs,
//   updateWhyChooseUs,
//   uploadWhyChooseBg,
//   deleteWhyChooseBg,
// } from "../controllers/whyChooseUs.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // Save to s3://<bucket>/sections/whychoose/bg/...
// const bgUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/whychoose/bg" };
//   return upload.single("image")(req, res, next);
// };

// router.get("/:userId/:templateId", getWhyChooseUs);
// router.put("/:userId/:templateId", updateWhyChooseUs);
// router.post("/:userId/:templateId/bg", bgUpload, uploadWhyChooseBg);
// router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

// export default router;






import express from "express";
import {
  getWhyChooseUs,
  updateWhyChooseUs,
  uploadWhyChooseBg,
  uploadWhyChooseBgBase64,
  deleteWhyChooseBg,
} from "../controllers/whyChooseUs.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// multipart upload → s3://<bucket>/sections/whychoose/bg/...
const bgUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/whychoose/bg" };
  return upload.single("image")(req, res, next);
};

router.get("/:userId/:templateId", getWhyChooseUs);
router.put("/:userId/:templateId", updateWhyChooseUs);

// multipart file upload
router.post("/:userId/:templateId/bg", bgUpload, uploadWhyChooseBg);

// base64 JSON upload
router.post("/:userId/:templateId/bg-base64", uploadWhyChooseBgBase64);

// delete background (also clears DB field)
router.delete("/:userId/:templateId/bg", deleteWhyChooseBg);

export default router;
