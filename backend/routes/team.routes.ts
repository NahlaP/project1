

// import express from "express";
// import { upload } from "../middleware/upload";
// import {
//   getTeam,
//   createTeamMember,
//   updateTeamMember,
//   deleteTeamMember,
//   uploadTeamImageBase64,
// } from "../controllers/team.controller";

// const router = express.Router();

// /** For create: put uploads in sections/team */
// const teamCreateUpload = (req: any, _res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/team" };
//   return upload.single("image")(req, _res, next);
// };

// /** For update: put uploads in sections/team/<id> */
// const teamUpdateUpload = (req: any, _res: any, next: any) => {
//   const { id } = req.params;
//   req.params = { ...(req.params || {}), folder: `sections/team/${id || "misc"}` };
//   return upload.single("image")(req, _res, next);
// };

// // List
// router.get("/:userId/:templateId", getTeam);

// // Create (multipart image optional)
// router.post("/:userId/:templateId", teamCreateUpload, createTeamMember);

// // Update (multipart image optional)
// router.patch("/:id", teamUpdateUpload, updateTeamMember);

// // OPTIONAL: base64 image upload for a member
// router.post("/:userId/:templateId/:id/image-base64", uploadTeamImageBase64);

// // Delete
// router.delete("/:id", deleteTeamMember);

// export default router;




import express from "express";

// ✅ Import uploadImage (keep upload too for any other usage)
import { upload, uploadImage } from "../middleware/upload";

import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamImageBase64,
} from "../controllers/team.controller";

const router = express.Router();

/** For create: put uploads in sections/team */
const teamCreateUpload = (req: any, _res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/team" };

  // BEFORE:
  // return upload.single("image")(req, _res, next);

  // AFTER: same upload + auto Media record
  return uploadImage(req, _res, next);
};

/** For update: put uploads in sections/team/<id> */
const teamUpdateUpload = (req: any, _res: any, next: any) => {
  const { id } = req.params;
  req.params = { ...(req.params || {}), folder: `sections/team/${id || "misc"}` };

  // BEFORE:
  // return upload.single("image")(req, _res, next);

  // AFTER: same upload + auto Media record
  return uploadImage(req, _res, next);
};

// List
router.get("/:userId/:templateId", getTeam);

// Create (multipart image optional)
router.post("/:userId/:templateId", teamCreateUpload, createTeamMember);

// Update (multipart image optional)
router.patch("/:id", teamUpdateUpload, updateTeamMember);

// OPTIONAL: base64 image upload for a member
router.post("/:userId/:templateId/:id/image-base64", uploadTeamImageBase64);

// Delete
router.delete("/:id", deleteTeamMember);

export default router;
