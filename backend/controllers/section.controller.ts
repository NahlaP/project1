
// import { Request, Response } from 'express';
// import Section from '../models/section.model';
// import { makeUniqueSlug, toSlug } from '../utils/slug';

// /**
//  * GET /:userId/:templateId
//  * List all sections for a specific user/template
//  */
// export const getSections = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const sections = await Section.find({ userId, templateId }).sort({ order: 1, createdAt: 1 });
//     res.json(sections);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch sections' });
//   }
// };

// /**
//  * GET /by-id/:id
//  * Get single section (page or section) by id
//  */
// export const getSectionById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const section = await Section.findById(id);
//     if (!section) return res.status(404).json({ message: 'Not found' });
//     res.json(section);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch section' });
//   }
// };

// /**
//  * POST /:userId/:templateId
//  * Create section or page
//  * - pages get unique slug
//  * - order is appended to the end of its group (pages or non-pages)
//  */
// export const createSection = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const { type, title, content } = req.body;

//     // find the last order for the same group
//     const groupFilter =
//       type === 'page'
//         ? { userId, templateId, type: 'page' }
//         : { userId, templateId, type: { $ne: 'page' } };

//     const last = await Section.find(groupFilter).sort({ order: -1 }).limit(1);
//     const nextOrder = last.length ? last[0].order + 1 : 0;

//     let slug: string | undefined;
//     if (type === 'page') {
//       const base = title || 'page';
//       slug = await makeUniqueSlug(base, async (s) => {
//         const found = await Section.findOne({ userId, templateId, type: 'page', slug: s });
//         return !!found;
//       });
//     }

//     const doc = await Section.create({
//       userId,
//       templateId,
//       type,
//       title,
//       slug,
//       order: nextOrder,
//       content,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to create section' });
//   }
// };

// /**
//  * POST /reorder/:userId/:templateId
//  * Body: { items: [{ _id: string, order: number }, ...] }
//  * Reorder provided items
//  */
// export const reorderSections = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const { items } = req.body as { items: { _id: string; order: number }[] };

//     if (!Array.isArray(items))
//       return res.status(400).json({ message: 'items must be an array' });

//     const bulk = items.map((i) => ({
//       updateOne: {
//         filter: { _id: i._id, userId, templateId },
//         update: { $set: { order: i.order } },
//       },
//     }));

//     await Section.bulkWrite(bulk);
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to reorder sections' });
//   }
// };

// /**
//  * PATCH /:id
//  * Update single section/page
//  * - If user changes title of a page and sends `regenerateSlug: true`, create a new slug
//  */
// export const updateSection = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { title, type, content, order, regenerateSlug } = req.body;

//     const doc = await Section.findById(id);
//     if (!doc) return res.status(404).json({ message: 'Not found' });

//     if (typeof title !== 'undefined') doc.title = title;
//     if (typeof type !== 'undefined') doc.type = type;
//     if (typeof order !== 'undefined') doc.order = order;
//     if (typeof content !== 'undefined') doc.content = content;

//     if (regenerateSlug && doc.type === 'page') {
//       const base = title || doc.title || 'page';
//       doc.slug = await makeUniqueSlug(base, async (s) => {
//         const exists = await Section.findOne({
//           _id: { $ne: doc._id },
//           userId: doc.userId,
//           templateId: doc.templateId,
//           type: 'page',
//           slug: s,
//         });
//         return !!exists;
//       });
//     }

//     await doc.save();
//     res.json(doc);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to update section' });
//   }
// };

// /**
//  * DELETE /:id
//  * Delete a section
//  */
// export const deleteSection = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const doc = await Section.findByIdAndDelete(id);
//     if (!doc) return res.status(404).json({ message: 'Not found' });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to delete section' });
//   }
// };

// /**
//  * POST /backfill-slugs/:userId/:templateId
//  * Generate slugs for pages missing slug
//  */
// export const backfillSlugs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;

//     const pagesWithoutSlug = await Section.find({
//       userId,
//       templateId,
//       type: 'page',
//       $or: [{ slug: { $exists: false } }, { slug: '' }],
//     });

//     for (const page of pagesWithoutSlug) {
//       const base = page.title || 'page';
//       page.slug = await makeUniqueSlug(base, async (s) => {
//         const exists = await Section.findOne({
//           _id: { $ne: page._id },
//           userId,
//           templateId,
//           type: 'page',
//           slug: s,
//         });
//         return !!exists;
//       });
//       await page.save();
//     }

//     res.json({ updated: pagesWithoutSlug.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to backfill slugs' });
//   }
// };
import { Request, Response } from 'express';
import Section from '../models/section.model';
import { makeUniqueSlug, toSlug } from '../utils/slug';

/**
 * GET /:userId/:templateId
 * List all sections for a specific user/template
 */
export const getSections = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const sections = await Section.find({ userId, templateId }).sort({ order: 1, createdAt: 1 });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
};

/**
 * GET /by-id/:id
 * Get single section (page or section) by id
 */
export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: 'Not found' });
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch section' });
  }
};

/**
 * POST /:userId/:templateId
 * Create section or page
 * - pages get unique slug
 * - order is appended to the end of its group (pages or non-pages)
 */
export const createSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const { type, title, content, parentPageId } = req.body;

    const groupFilter =
      type === 'page'
        ? { userId, templateId, type: 'page' }
        : { userId, templateId, type: { $ne: 'page' } };

    const last = await Section.find(groupFilter).sort({ order: -1 }).limit(1);
    const nextOrder = last.length ? last[0].order + 1 : 0;

    let slug: string | undefined;
    if (type === 'page') {
      const base = title || 'page';
      slug = await makeUniqueSlug(base, async (s) => {
        const found = await Section.findOne({ userId, templateId, type: 'page', slug: s });
        return !!found;
      });
    }

    const doc = await Section.create({
      userId,
      templateId,
      type,
      title,
      slug,
      order: nextOrder,
      content,
      parentPageId,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create section' });
  }
};

/**
 * POST /reorder/:userId/:templateId
 * Body: { items: [{ _id: string, order: number }, ...] }
 * Reorder provided items
 */
export const reorderSections = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const { items } = req.body as { items: { _id: string; order: number }[] };

    if (!Array.isArray(items))
      return res.status(400).json({ message: 'items must be an array' });

    const bulk = items.map((i) => ({
      updateOne: {
        filter: { _id: i._id, userId, templateId },
        update: { $set: { order: i.order } },
      },
    }));

    await Section.bulkWrite(bulk);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reorder sections' });
  }
};

/**
 * PATCH /:id
 * Update single section/page
 * - If user changes title of a page and sends `regenerateSlug: true`, create a new slug
 */
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, content, order, regenerateSlug, parentPageId } = req.body;

    const doc = await Section.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (typeof title !== 'undefined') doc.title = title;
    if (typeof type !== 'undefined') doc.type = type;
    if (typeof order !== 'undefined') doc.order = order;
    if (typeof content !== 'undefined') doc.content = content;
    if (typeof parentPageId !== 'undefined') doc.parentPageId = parentPageId;

    if (regenerateSlug && doc.type === 'page') {
      const base = title || doc.title || 'page';
      doc.slug = await makeUniqueSlug(base, async (s) => {
        const exists = await Section.findOne({
          _id: { $ne: doc._id },
          userId: doc.userId,
          templateId: doc.templateId,
          type: 'page',
          slug: s,
        });
        return !!exists;
      });
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update section' });
  }
};

/**
 * DELETE /:id
 * Delete a section
 */
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Section.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete section' });
  }
};

/**
 * POST /backfill-slugs/:userId/:templateId
 * Generate slugs for pages missing slug
 */
export const backfillSlugs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;

    const pagesWithoutSlug = await Section.find({
      userId,
      templateId,
      type: 'page',
      $or: [{ slug: { $exists: false } }, { slug: '' }],
    });

    for (const page of pagesWithoutSlug) {
      const base = page.title || 'page';
      page.slug = await makeUniqueSlug(base, async (s) => {
        const exists = await Section.findOne({
          _id: { $ne: page._id },
          userId,
          templateId,
          type: 'page',
          slug: s,
        });
        return !!exists;
      });
      await page.save();
    }

    res.json({ updated: pagesWithoutSlug.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to backfill slugs' });
  }
};
// GET /api/sections?userId=...&templateId=...
export const listSectionsByQuery = async (req: Request, res: Response) => {
  const { userId, templateId } = req.query;

  if (!userId || !templateId) {
    return res.status(400).json({ error: 'Missing userId or templateId' });
  }

  try {
    const sections = await Section.find({
      userId: String(userId),
      templateId: String(templateId),
    }).sort({ order: 1, createdAt: 1 });

    res.json(sections);
  } catch (err) {
    console.error('Failed to fetch sections by query:', err);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
};
// PATCH /assign-to-page
export const assignSectionsToPage = async (req: Request, res: Response) => {
  try {
    const { sectionIds, parentPageId } = req.body;

    if (!Array.isArray(sectionIds) || !parentPageId) {
      return res.status(400).json({ message: "Missing sectionIds or parentPageId" });
    }

    await Section.updateMany(
      { _id: { $in: sectionIds } },
      { parentPageId }
    );

    res.json({ message: "Sections assigned successfully" });
  } catch (err) {
    console.error("❌ Assign error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
