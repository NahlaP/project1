
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

// router.post(
//   "/:userId/:templateId",
//   (req, res, next) => {
//     req.params.folder = "team";
//     next();
//   },
//   upload.single("image"),
//   createTeamMember
// );

// // ✅ ✅ ✅ Add this PATCH route
// router.patch(
//   "/:id",
//   (req, res, next) => {
//     req.params.folder = "team";
//     next();
//   },
//   upload.single("image"),
//   updateTeamMember
// );

// router.delete("/:id", deleteTeamMember);


// export default router;




// routes/team.routes.ts
import express from "express";
import { upload } from "../middleware/upload";
import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller";

const router = express.Router();

router.get("/:userId/:templateId", getTeam);

// Create (multipart form-data: image optional)
// S3 prefix -> sections/team
router.post(
  "/:userId/:templateId",
  (req, _res, next) => {
    req.params.folder = "sections/team";
    next();
  },
  upload.single("image"),
  createTeamMember
);

// Update (multipart form-data: image optional)
router.patch(
  "/:id",
  (req, _res, next) => {
    req.params.folder = "sections/team";
    next();
  },
  upload.single("image"),
  updateTeamMember
);

// Delete
router.delete("/:id", deleteTeamMember);

export default router;
