// import express from "express";
// import {
//   getNavbar,
//   saveNavbar,
//   addNavbarItem,
//   deleteNavbarItem,
//   editNavbarItem,
//   reorderNavbarItems
// } from "../controllers/navbar.controller";

// const router = express.Router();

// router.get("/:userId/:templateId", getNavbar);
// router.post("/:userId/:templateId", saveNavbar);
// router.post("/:userId/:templateId/add", addNavbarItem);
// router.delete("/:userId/:templateId/:itemId", deleteNavbarItem);
// router.put("/:userId/:templateId/:itemId", editNavbarItem); 
// router.put("/:userId/:templateId/reorder", reorderNavbarItems);
// export default router;
import express from "express";
import {
  getNavbar,
  saveNavbar,
  addNavbarItem,
  deleteNavbarItem,
  editNavbarItem,
  reorderNavbarItems,
  createSection
} from "../controllers/navbar.controller";

const router = express.Router();

router.get("/:userId/:templateId", getNavbar);
router.post("/:userId/:templateId", saveNavbar);
router.post("/:userId/:templateId/add", addNavbarItem);
router.delete("/:userId/:templateId/:itemId", deleteNavbarItem);
router.put("/:userId/:templateId/:itemId", editNavbarItem); 
router.put("/:userId/:templateId/reorder", reorderNavbarItems);
router.post('/:userId/:templateId/create', createSection);
export default router;
