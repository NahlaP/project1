


// // routes/team.routes.ts
// import express from "express";
// import { upload } from "../middleware/upload";
// import {
//   getTeam,
//   createTeamMember,
//   updateTeamMember,
//   deleteTeamMember,
// } from "../controllers/team.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getTeam);

// // Create (multipart form-data: image optional)
// // S3 prefix -> sections/team
// router.post(
//   "/:userId/:templateId",
//   (req, _res, next) => {
//     req.params.folder = "sections/team";
//     next();
//   },
//   upload.single("image"),
//   createTeamMember
// );

// // Update (multipart form-data: image optional)
// router.patch(
//   "/:id",
//   (req, _res, next) => {
//     req.params.folder = "sections/team";
//     next();
//   },
//   upload.single("image"),
//   updateTeamMember
// );

// // Delete
// router.delete("/:id", deleteTeamMember);

// export default router;


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
import { upload } from "../middleware/upload";
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
  return upload.single("image")(req, _res, next);
};

/** For update: put uploads in sections/team/<id> */
const teamUpdateUpload = (req: any, _res: any, next: any) => {
  const { id } = req.params;
  req.params = { ...(req.params || {}), folder: `sections/team/${id || "misc"}` };
  return upload.single("image")(req, _res, next);
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
