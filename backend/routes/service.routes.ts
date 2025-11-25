

// import express from "express";
// import {
//   getServices,
//   addService,
//   updateService,
//   upsertServices,
//   uploadServiceImage,
//   uploadServiceImageBase64,
//   deleteServiceImage,
//   deleteServiceById,
// } from "../controllers/service.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // Put each image under a per-service path, e.g. sections/services/<serviceId>/...
// const serviceImageUpload = (req: any, res: any, next: any) => {
//   const { serviceId } = req.params;
//   const folder = `sections/services/${serviceId || "misc"}`;
//   req.params = { ...(req.params || {}), folder };
//   return upload.single("image")(req, res, next);
// };

// // CRUD
// router.get("/:userId/:templateId", getServices);
// router.put("/:userId/:templateId", upsertServices);
// router.post("/:userId/:templateId", addService);
// router.put("/:userId/:templateId/:serviceId", updateService);
// router.delete("/:userId/:templateId/:serviceId", deleteServiceById);

// // Images (multipart + base64)
// router.post("/:userId/:templateId/:serviceId/image", serviceImageUpload, uploadServiceImage);
// router.post("/:userId/:templateId/:serviceId/image-base64", uploadServiceImageBase64);
// router.delete("/:userId/:templateId/:serviceId/image", deleteServiceImage);

// export default router;







import express from "express";
import {
  getServices,
  addService,
  updateService,
  upsertServices,
  uploadServiceImage,
  uploadServiceImageBase64,
  deleteServiceImage,
  deleteServiceById,
} from "../controllers/service.controller";

// ✅ Import uploadImage (keep upload for base64 routes)
import { upload, uploadImage } from "../middleware/upload";

const router = express.Router();

// Put each image under a per-service path, e.g. sections/services/<serviceId>/...
const serviceImageUpload = (req: any, res: any, next: any) => {
  const { serviceId } = req.params;
  const folder = `sections/services/${serviceId || "misc"}`;
  req.params = { ...(req.params || {}), folder };

  // BEFORE:
  // return upload.single("image")(req, res, next);

  // AFTER: auto media recording
  return uploadImage(req, res, next);
};

// CRUD
router.get("/:userId/:templateId", getServices);
router.put("/:userId/:templateId", upsertServices);
router.post("/:userId/:templateId", addService);
router.put("/:userId/:templateId/:serviceId", updateService);
router.delete("/:userId/:templateId/:serviceId", deleteServiceById);

// Images (multipart + base64)
router.post(
  "/:userId/:templateId/:serviceId/image",
  serviceImageUpload,
  uploadServiceImage
);

router.post(
  "/:userId/:templateId/:serviceId/image-base64",
  uploadServiceImageBase64
);

router.delete(
  "/:userId/:templateId/:serviceId/image",
  deleteServiceImage
);

export default router;
