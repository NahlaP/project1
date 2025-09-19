


import express from "express";
import {
  getServices,
  addService,
  updateService,
  upsertServices,
  uploadServiceImage,
  deleteServiceImage,
  deleteServiceById,
} from "../controllers/service.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// Put each image under a per-service path, e.g. sections/services/<serviceId>/...
const serviceImageUpload = (req: any, res: any, next: any) => {
  const { serviceId } = req.params;
  const folder = `sections/services/${serviceId || "misc"}`;
  req.params = { ...(req.params || {}), folder };
  return upload.single("image")(req, res, next);
};

// CRUD
router.get("/:userId/:templateId", getServices);
router.put("/:userId/:templateId", upsertServices);
router.post("/:userId/:templateId", addService);
router.put("/:userId/:templateId/:serviceId", updateService);
router.delete("/:userId/:templateId/:serviceId", deleteServiceById);

// Images
router.post("/:userId/:templateId/:serviceId/image", serviceImageUpload, uploadServiceImage);
router.delete("/:userId/:templateId/:serviceId/image", deleteServiceImage);

export default router;



// // cpanel
// import express from "express";
// import {
//   getServices,
//   addService,
//   updateService,
//   upsertServices,
//   deleteServiceById,
//   clearServiceImage,
//   getServiceUploadToken,
// } from "../controllers/service.controller";

// const router = express.Router();

// // CRUD
// router.get("/:userId/:templateId", getServices);
// router.put("/:userId/:templateId", upsertServices);
// router.post("/:userId/:templateId", addService);
// router.put("/:userId/:templateId/:serviceId", updateService);
// router.delete("/:userId/:templateId/:serviceId", deleteServiceById);

// // Images (no multer/S3)
// router.post("/:userId/:templateId/:serviceId/clear-image", clearServiceImage);
// router.post("/:userId/:templateId/upload-token", getServiceUploadToken);

// /** --- Legacy compatibility for your current UI (optional defaults) --- */
// const setDefaults = (req: any, _res: any, next: any) => {
//   req.params = req.params || {};
//   if (!req.params.userId) req.params.userId = "demo-user";
//   if (!req.params.templateId) req.params.templateId = "gym-template-1";
//   next();
// };
// router.post("/save", setDefaults, upsertServices);

// export default router;
