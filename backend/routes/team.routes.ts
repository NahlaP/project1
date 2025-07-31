// // routes/team.routes.ts
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

router.post(
  "/:userId/:templateId",
  (req, res, next) => {
    req.params.folder = "team";
    next();
  },
  upload.single("image"),
  createTeamMember
);

// ✅ ✅ ✅ Add this PATCH route
router.patch(
  "/:id",
  (req, res, next) => {
    req.params.folder = "team";
    next();
  },
  upload.single("image"),
  updateTeamMember
);

router.delete("/:id", deleteTeamMember);


export default router;
