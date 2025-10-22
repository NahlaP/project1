

// import express from "express";
// import {
//   getBlogs,
//   upsertBlogs,
//   addBlog,
//   updateBlog,
//   deleteBlog,
//   uploadBlogImage,
//   deleteBlogImage,
// } from "../controllers/blogs.controller";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// // store images under: sections/blogs/<postId>/...
// const blogImageUpload = (req: any, res: any, next: any) => {
//   const { postId } = req.params;
//   const folder = `sections/blogs/${postId || "misc"}`;
//   req.params = { ...(req.params || {}), folder };
//   return upload.single("image")(req, res, next);
// };

// // CRUD
// router.get("/:userId/:templateId", getBlogs);
// router.put("/:userId/:templateId", upsertBlogs);
// router.post("/:userId/:templateId", addBlog);
// router.put("/:userId/:templateId/:postId", updateBlog);
// router.delete("/:userId/:templateId/:postId", deleteBlog);

// // Images
// router.post("/:userId/:templateId/:postId/image", blogImageUpload, uploadBlogImage);
// router.delete("/:userId/:templateId/:postId/image", deleteBlogImage);

// export default router;








// C:\Users\97158\Desktop\project1 dev\project1\backend\routes\blogs.routes.ts
import express from "express";
import {
  getBlogs,
  upsertBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
  deleteBlogImage,
  resetBlogs,
} from "../controllers/blogs.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

// store images under: sections/blogs/<postId>/...
const blogImageUpload = (req: any, res: any, next: any) => {
  const { postId } = req.params;
  const folder = `sections/blogs/${postId || "misc"}`;
  req.params = { ...(req.params || {}), folder };
  return upload.single("image")(req, res, next);
};

// CRUD
router.get("/:userId/:templateId", getBlogs);
router.put("/:userId/:templateId", upsertBlogs);
router.post("/:userId/:templateId", addBlog);
router.put("/:userId/:templateId/:postId", updateBlog);
router.delete("/:userId/:templateId/:postId", deleteBlog);

// Reset like Projects
router.post("/:userId/:templateId/reset", resetBlogs);

// Images
router.post("/:userId/:templateId/:postId/image", blogImageUpload, uploadBlogImage);
router.delete("/:userId/:templateId/:postId/image", deleteBlogImage);

export default router;
