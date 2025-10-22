


// import { Request, Response } from "express";
// import Navbar from "../models/Navbar";
// import Section from "../models/section.model";

// // 📥 Get Navbar Items
// export const getNavbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   try {
//     const navbar = await Navbar.findOne({ userId, templateId });
//     res.status(200).json(navbar?.items || []);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch navbar items" });
//   }
// };

// // 💾 Save Full Navbar Items (overwrite all)
// export const saveNavbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { items } = req.body;
//   if (!Array.isArray(items))
//     return res.status(400).json({ error: "Invalid format" });

//   try {
//     const updated = await Navbar.findOneAndUpdate(
//       { userId, templateId },
//       { items },
//       { upsert: true, new: true }
//     );
//     res.status(200).json(updated.items);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to save navbar items" });
//   }
// };

// // ➕ Add Navbar Item
// export const addNavbarItem = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { label, href, type = "link", dropdown = false, children = [] } =
//     req.body;

//   if (!label || !href) {
//     return res.status(400).json({ error: "Label and href are required" });
//   }

//   try {
//     const result = await Navbar.findOneAndUpdate(
//       { userId, templateId },
//       {
//         $push: {
//           items: {
//             label,
//             href,
//             type,
//             dropdown,
//             children,
//           },
//         },
//       },
//       { new: true, upsert: true }
//     );

//     const newlyAddedItem = result?.items[result.items.length - 1];
//     res.status(201).json(newlyAddedItem);
//   } catch (err) {
//     console.error("❌ Add navbar item failed:", err);
//     res.status(500).json({ error: "Failed to add navbar item" });
//   }
// };

// // ❌ Delete Navbar Item
// export const deleteNavbarItem = async (req: Request, res: Response) => {
//   const { userId, templateId, itemId } = req.params;

//   if (!itemId) {
//     return res.status(400).json({ error: "Item ID is required" });
//   }

//   try {
//     const updated = await Navbar.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { items: { _id: itemId } } },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Navbar item deleted",
//       items: updated?.items || [],
//     });
//   } catch (err) {
//     console.error("❌ Delete navbar item failed:", err);
//     res.status(500).json({ error: "Failed to delete navbar item" });
//   }
// };

// // ✏️ Edit Navbar Item
// export const editNavbarItem = async (req: Request, res: Response) => {
//   const { userId, templateId, itemId } = req.params;
//   const { label, href, type = "link", dropdown = false, children = [] } =
//     req.body;

//   if (!label || !href) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     const navbar = await Navbar.findOneAndUpdate(
//       {
//         userId,
//         templateId,
//         "items._id": itemId,
//       },
//       {
//         $set: {
//           "items.$.label": label,
//           "items.$.href": href,
//           "items.$.type": type,
//           "items.$.dropdown": dropdown,
//           "items.$.children": children,
//         },
//       },
//       { new: true }
//     );

//     if (!navbar) {
//       return res.status(404).json({ error: "Navbar or item not found" });
//     }

//     res.status(200).json({ message: "Item updated", items: navbar.items });
//   } catch (err) {
//     console.error("❌ Edit failed:", err);
//     res.status(500).json({ error: "Failed to update navbar item" });
//   }
// };

// // 🔃 Reorder Navbar Items
// export const reorderNavbarItems = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { reorderedItems } = req.body;

//   if (!Array.isArray(reorderedItems)) {
//     return res.status(400).json({ error: "Invalid format" });
//   }

//   try {
//     const navbar = await Navbar.findOneAndUpdate(
//       { userId, templateId },
//       { items: reorderedItems },
//       { new: true }
//     );

//     res
//       .status(200)
//       .json({ message: "Navbar reordered", items: navbar?.items || [] });
//   } catch (err) {
//     console.error("❌ Reorder failed:", err);
//     res.status(500).json({ error: "Failed to reorder navbar items" });
//   }
// };

// // ➕ Create Section (and optionally add to Navbar if page)
// export const createSection = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { title, slug, type, content } = req.body;

//   try {
//     const newSection = await Section.create({
//       userId,
//       templateId,
//       title,
//       slug,
//       type,
//       content,
//     });

//     // ✅ Auto-add to Navbar if it's a new PAGE
//     if (type === "page") {
//       const exists = await Navbar.findOne({
//         userId,
//         templateId,
//         "items.href": slug,
//       });

//       if (!exists) {
//         await Navbar.findOneAndUpdate(
//           { userId, templateId },
//           {
//             $push: {
//               items: {
//                 label: title,
//                 href: slug,
//                 type: "link",
//                 dropdown: false,
//                 children: [],
//               },
//             },
//           },
//           { upsert: true, new: true }
//         );
//       }
//     }

//     res.status(201).json(newSection);
//   } catch (err) {
//     console.error("❌ Section creation failed:", err);
//     res.status(500).json({ error: "Failed to create section" });
//   }
// };

















// backend/controllers/navbar.controller.ts
import { Request, Response } from "express";
import Navbar from "../models/Navbar";
import Section from "../models/section.model";

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

type NavChild = {
  _id?: string;
  label: string;
  href: string;
  type?: "link" | "button" | "external";
};

type NavItem = {
  _id?: string;
  label: string;
  href: string;
  type?: "link" | "button" | "external";
  dropdown?: boolean;
  children?: NavChild[];
};

function isString(v: any): v is string {
  return typeof v === "string";
}

/** Normalize hrefs to something safe for your site. Leaves full links alone. */
function normalizeHref(href: string): string {
  const h = String(href || "").trim();
  if (!h) return "/";
  // keep http(s) and mailto/tel
  if (/^(https?:\/\/|mailto:|tel:)/i.test(h)) return h;
  // normalize to /slug form (no double slashes)
  return ("/" + h).replace(/\/{2,}/g, "/");
}

function normalizeItem(raw: any): NavItem | null {
  const label = isString(raw?.label) ? raw.label.trim() : "";
  const href = isString(raw?.href) ? normalizeHref(raw.href) : "";
  if (!label || !href) return null;

  const type: NavItem["type"] =
    raw?.type === "button" || raw?.type === "external" ? raw.type : "link";

  const dropdown = !!raw?.dropdown;

  let children: NavChild[] = [];
  if (dropdown && Array.isArray(raw?.children)) {
    children = raw.children
      .map((c: any) => {
        const clabel = isString(c?.label) ? c.label.trim() : "";
        const chref = isString(c?.href) ? normalizeHref(c.href) : "";
        if (!clabel || !chref) return null;
        const ctype: NavChild["type"] =
          c?.type === "button" || c?.type === "external" ? c.type : "link";
        return { _id: c?._id, label: clabel, href: chref, type: ctype };
      })
      .filter(Boolean) as NavChild[];
  }

  return {
    _id: raw?._id,
    label,
    href,
    type,
    dropdown,
    children,
  };
}

function normalizeItems(arr: any): NavItem[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const out: NavItem[] = [];
  for (const r of arr) {
    const item = normalizeItem(r);
    if (!item) continue;
    // avoid duplicates by label+href combo
    const sig = `${item.label}__${item.href}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(item);
  }
  return out;
}

/* ---------------- controllers ---------------- */

// 📥 Get Navbar Items
export const getNavbar = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const navbar = await Navbar.findOne({ userId, templateId }).lean<any>();

    return res.status(200).json(Array.isArray(navbar?.items) ? navbar!.items : []);
  } catch (err) {
    console.error("getNavbar error:", err);
    return res.status(500).json({ error: "Failed to fetch navbar items" });
  }
};

// 💾 Save Full Navbar Items (overwrite all)
export const saveNavbar = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { items } = (req.body || {}) as { items?: any[] };
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid format: items must be an array" });
    }

    const normalized = normalizeItems(items);

    const updated = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: normalized } },
      { upsert: true, new: true }
    );

    return res.status(200).json(updated.items || []);
  } catch (err) {
    console.error("saveNavbar error:", err);
    return res.status(500).json({ error: "Failed to save navbar items" });
  }
};

// ➕ Add Navbar Item
export const addNavbarItem = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const draft = normalizeItem(req.body);
    if (!draft) {
      return res.status(400).json({ error: "Label and href are required" });
    }

    const result = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { $push: { items: draft } },
      { new: true, upsert: true }
    );

    const newlyAddedItem = result?.items[result.items.length - 1];
    return res.status(201).json(newlyAddedItem);
  } catch (err) {
    console.error("addNavbarItem error:", err);
    return res.status(500).json({ error: "Failed to add navbar item" });
  }
};

// ❌ Delete Navbar Item
export const deleteNavbarItem = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ error: "Item ID is required" });

    const updated = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    return res.status(200).json({
      message: "Navbar item deleted",
      items: updated?.items || [],
    });
  } catch (err) {
    console.error("deleteNavbarItem error:", err);
    return res.status(500).json({ error: "Failed to delete navbar item" });
  }
};

// ✏️ Edit Navbar Item
export const editNavbarItem = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, itemId } = req.params;

    // Normalize incoming body while preserving _id for the positional update
    const draft = normalizeItem({ ...(req.body || {}), _id: itemId });
    if (!draft) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    // Prepare $set fields
    const set: any = {
      "items.$.label": draft.label,
      "items.$.href": draft.href,
      "items.$.type": draft.type || "link",
      "items.$.dropdown": !!draft.dropdown,
    };
    if (Array.isArray(draft.children)) set["items.$.children"] = draft.children;

    const navbar = await Navbar.findOneAndUpdate(
      { userId, templateId, "items._id": itemId },
      { $set: set },
      { new: true }
    );

    if (!navbar) {
      return res.status(404).json({ error: "Navbar or item not found" });
    }

    return res.status(200).json({ message: "Item updated", items: navbar.items });
  } catch (err) {
    console.error("editNavbarItem error:", err);
    return res.status(500).json({ error: "Failed to update navbar item" });
  }
};

// 🔃 Reorder Navbar Items
export const reorderNavbarItems = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { reorderedItems } = (req.body || {}) as { reorderedItems?: any[] };
    if (!Array.isArray(reorderedItems)) {
      return res.status(400).json({ error: "Invalid format: reorderedItems must be an array" });
    }

    const normalized = normalizeItems(reorderedItems);

    const navbar = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: normalized } },
      { new: true, upsert: true }
    );

    return res
      .status(200)
      .json({ message: "Navbar reordered", items: navbar?.items || [] });
  } catch (err) {
    console.error("reorderNavbarItems error:", err);
    return res.status(500).json({ error: "Failed to reorder navbar items" });
  }
};

// ➕ Create Section (and optionally add to Navbar if page)
export const createSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { title, slug, type, content } = (req.body || {}) as {
      title?: string;
      slug?: string;
      type?: string;
      content?: any;
    };

    const safeTitle = String(title || "").trim() || "Untitled";
    const safeSlug = ("/" + String(slug || safeTitle).toLowerCase().replace(/\s+/g, "-"))
      .replace(/\/{2,}/g, "/");

    const newSection = await Section.create({
      userId,
      templateId,
      title: safeTitle,
      slug: safeSlug.replace(/^\//, ""), // store without leading slash if your model expects that
      type,
      content,
    });

    // ✅ Auto-add to Navbar if it's a new PAGE
    if (type === "page") {
      const href = normalizeHref(safeSlug);
      const exists = await Navbar.findOne({
        userId,
        templateId,
        "items.href": href,
      }).lean();

      if (!exists) {
        await Navbar.findOneAndUpdate(
          { userId, templateId },
          {
            $push: {
              items: {
                label: safeTitle,
                href,
                type: "link",
                dropdown: false,
                children: [],
              } as NavItem,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    return res.status(201).json(newSection);
  } catch (err) {
    console.error("createSection error:", err);
    return res.status(500).json({ error: "Failed to create section" });
  }
};
