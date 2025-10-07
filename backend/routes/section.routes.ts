
// import { Router } from 'express';
// import {
//   getSections,
//   getSectionById,
//   createSection,
//   reorderSections,
//   updateSection,
//   deleteSection,
//   backfillSlugs
// } from '../controllers/section.controller';

// const router = Router();

// // ✅ Get a single section/page by ID (for frontend or CMS edit)
// router.get('/by-id/:id', getSectionById);  // 👈 Move this to the top

// // ✅ List all sections for a specific user/template
// router.get('/:userId/:templateId', getSections);

// // ✅ Create a new section/page
// router.post('/:userId/:templateId', createSection);

// // ✅ Reorder multiple sections
// router.post('/reorder/:userId/:templateId', reorderSections);

// // ✅ Backfill slugs
// router.post('/backfill-slugs/:userId/:templateId', backfillSlugs);

// // ✅ Update a section
// router.patch('/:id', updateSection);

// // ✅ Delete a section
// router.delete('/:id', deleteSection);

// export default router;











// // og
// import { Router } from 'express';
// import {
//   getSections,
//   getSectionById,
//   createSection,
//   reorderSections,
//   updateSection,
//   deleteSection,
//   backfillSlugs,
//   listSectionsByQuery, // 👈 ADD THIS
//   assignSectionsToPage
// } from '../controllers/section.controller';

// const router = Router();

// router.get('/by-id/:id', getSectionById);

// // ✅ NEW: List all sections using query (for CMS page/[id].js)
// router.get('/', listSectionsByQuery); // 👈 ADD THIS before the dynamic route

// router.get('/:userId/:templateId', getSections);
// router.post('/:userId/:templateId', createSection);
// router.post('/reorder/:userId/:templateId', reorderSections);
// router.post('/backfill-slugs/:userId/:templateId', backfillSlugs);
// router.patch("/assign-to-page", assignSectionsToPage); 
// router.patch('/:id', updateSection);
// router.delete('/:id', deleteSection);

// export default router;














import { Router } from "express";
import {
  getSections,
  getSectionById,
  createSection,
  reorderSections,
  updateSection,
  deleteSection,
  backfillSlugs,
  listSectionsByQuery,
  assignSectionsToPage,
} from "../controllers/section.controller";

const router = Router();

// Single first (by id)
router.get("/by-id/:id", getSectionById);

// Query-style list (dashboard + page-loader rely on this)
router.get("/", listSectionsByQuery);

// Path-style list; supports ?type=...&slug=...&parentPageId=...&visible=...&findOne=true
router.get("/:userId/:templateId", getSections);

// Create & bulk operations
router.post("/:userId/:templateId", createSection);
router.post("/reorder/:userId/:templateId", reorderSections);
router.post("/backfill-slugs/:userId/:templateId", backfillSlugs);

// Assign & update & delete
router.patch("/assign-to-page", assignSectionsToPage);
router.patch("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;











