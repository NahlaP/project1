


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





// routes/team.routes.ts
import express from "express";
import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  clearTeamMemberImage,
  getTeamUploadToken,
} from "../controllers/team.controller";

const router = express.Router();

/** --- REST-style routes (NO S3, NO multer) --- */
router.get("/:userId/:templateId", getTeam);
router.post("/:userId/:templateId", createTeamMember);
router.patch("/:id", updateTeamMember);
router.delete("/:id", deleteTeamMember);

// Helpers (match hero-style)
router.post("/:userId/:templateId/upload-token", getTeamUploadToken);
router.post("/:id/clear-image", clearTeamMemberImage);

/** --- Legacy compatibility for your current UI (optional defaults) --- */
const setDefaults = (req: any, _res: any, next: any) => {
  req.params = req.params || {};
  if (!req.params.userId) req.params.userId = "demo-user";
  if (!req.params.templateId) req.params.templateId = "gym-template-1";
  next();
};
router.post("/save", setDefaults, createTeamMember);

export default router;
