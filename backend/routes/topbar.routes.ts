


// // routes/topbar.routes.ts
// import express from "express";
// import { upload } from "../middleware/upload";
// import {
//   getTopbar,
//   updateTopbar,
//   uploadLogo,
//   deleteLogo,
// } from "../controllers/topbar.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getTopbar);
// router.put("/:userId/:templateId", updateTopbar);

// // S3 upload → s3://.../sections/topbar/...
// router.post(
//   "/:userId/:templateId/logo",
//   (req, _res, next) => {
//     req.params.folder = "sections/topbar";
//     next();
//   },
//   upload.single("logo"),
//   uploadLogo
// );

// router.delete("/:userId/:templateId/logo", deleteLogo);

// export default router;

// routes/topbar.routes.ts
import express from "express";

// ✅ use uploadImage so Media entry is auto-created
import { upload, uploadImage } from "../middleware/upload";

import {
  getTopbar,
  updateTopbar,
  uploadLogo,
  deleteLogo,
} from "../controllers/topbar.controller";

const router = express.Router();

router.get("/:userId/:templateId", getTopbar);
router.put("/:userId/:templateId", updateTopbar);

// S3 upload → s3://.../sections/topbar/...
router.post(
  "/:userId/:templateId/logo",
  (req: any, _res: any, next: any) => {
    req.params.folder = "sections/topbar"; // keep same folder
    next();
  },

  // BEFORE:
  // upload.single("logo"),

  // AFTER: auto Media Library recording
  uploadImage,

  uploadLogo
);

router.delete("/:userId/:templateId/logo", deleteLogo);

export default router;
