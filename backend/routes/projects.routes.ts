// import express from "express";
// import * as projects from "../controllers/projects.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // Keep uploads under sections/projects/
// const projUpload = (req: any, res: any, next: any) => {
//   req.params = { ...(req.params || {}), folder: "sections/projects" };
//   return upload.single("image")(req, res, next);
// };

// // REST
// router.get("/:userId/:templateId", projects.getProjects);
// router.put("/:userId/:templateId", projects.upsertProjects);

// // Image per project index
// router.post("/:userId/:templateId/image/:index", projUpload, projects.uploadProjectImage);
// router.delete("/:userId/:templateId/image/:index", projects.deleteProjectImage);

// export default router;













// C:\Users\97158\Desktop\project1\backend\routes\projects.routes.ts
import express from "express";
import * as projects from "../controllers/projects.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// Keep uploads under sections/projects/
const projUpload = (req: any, res: any, next: any) => {
  req.params = { ...(req.params || {}), folder: "sections/projects" };
  return upload.single("image")(req, res, next);
};

// REST
router.get("/:userId/:templateId", projects.getProjects);
router.put("/:userId/:templateId", projects.upsertProjects);

// RESET to template defaults (Hero/About style)
router.post("/:userId/:templateId/reset", projects.resetProjects);

// Image per project index
router.post("/:userId/:templateId/image/:index", projUpload, projects.uploadProjectImage);
router.delete("/:userId/:templateId/image/:index", projects.deleteProjectImage);

// Export router itself (CommonJS-style) so `import * as routes` works with app.use()
export = router;
