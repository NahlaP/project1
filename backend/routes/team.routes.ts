<<<<<<< HEAD
// // routes/team.routes.ts
// import express from "express";
=======

// import express from "express";
// import { upload } from "../middleware/upload";
>>>>>>> origin/nahla-update
// import {
//   getTeam,
//   createTeamMember,
//   updateTeamMember,
<<<<<<< HEAD
//   updateTeamMemberImage,
=======
>>>>>>> origin/nahla-update
//   deleteTeamMember,
// } from "../controllers/team.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getTeam);
<<<<<<< HEAD
// router.post("/:userId/:templateId", createTeamMember);
// router.put("/:id", updateTeamMember);
// router.post("/:id/image", updateTeamMemberImage); // <-- attach uploaded image URL
// router.delete("/:id", deleteTeamMember);

// export default router;
// routes/team.routes.ts
// import express from "express";
// import {
//   getTeam,
//   createTeamMember,
//   updateTeamMember,
//   updateTeamMemberImage,
//   deleteTeamMember,
// } from "../controllers/team.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getTeam);
// router.post("/:userId/:templateId", createTeamMember);
// router.put("/:id", updateTeamMember);
// router.post("/:id/image", updateTeamMemberImage); // <-- attach uploaded image URL
// router.delete("/:id", deleteTeamMember);

// export default router;
=======

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
>>>>>>> origin/nahla-update
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

<<<<<<< HEAD
router.post(
  "/:userId/:templateId",
  (req, res, next) => {
    req.params.folder = "team";
=======
// Create (multipart form-data: image optional)
// S3 prefix -> sections/team
router.post(
  "/:userId/:templateId",
  (req, _res, next) => {
    req.params.folder = "sections/team";
>>>>>>> origin/nahla-update
    next();
  },
  upload.single("image"),
  createTeamMember
);

<<<<<<< HEAD
// ✅ ✅ ✅ Add this PATCH route
router.patch(
  "/:id",
  (req, res, next) => {
    req.params.folder = "team";
=======
// Update (multipart form-data: image optional)
router.patch(
  "/:id",
  (req, _res, next) => {
    req.params.folder = "sections/team";
>>>>>>> origin/nahla-update
    next();
  },
  upload.single("image"),
  updateTeamMember
);

<<<<<<< HEAD
router.delete("/:id", deleteTeamMember);


=======
// Delete
router.delete("/:id", deleteTeamMember);

>>>>>>> origin/nahla-update
export default router;
