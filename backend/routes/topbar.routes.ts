


// routes/topbar.routes.ts
import express from "express";
import { upload } from "../middleware/upload";
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
  (req, _res, next) => {
    req.params.folder = "sections/topbar";
    next();
  },
  upload.single("logo"),
  uploadLogo
);

router.delete("/:userId/:templateId/logo", deleteLogo);

export default router;



// // routes/topbar.routes.ts
// import express from "express";
// import {
//   getTopbar,
//   updateTopbar,
//   clearLogo,
//   getTopbarUploadToken,
// } from "../controllers/topbar.controller";

// const router = express.Router();

// /** --- REST-style routes (NO S3, NO multer) --- */
// router.get("/:userId/:templateId", getTopbar);
// router.put("/:userId/:templateId", updateTopbar);
// router.post("/:userId/:templateId/clear-logo", clearLogo);
// router.post("/:userId/:templateId/upload-token", getTopbarUploadToken);

// /** --- Legacy compatibility for your current UI (optional defaults) --- */
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/save", setDefaults, updateTopbar);

// export default router;
