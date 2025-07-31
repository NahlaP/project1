// // backend/controllers/navbar.controller.ts
// import { Request, Response } from "express";
// import Navbar from "../models/Navbar";

// const userId = "demo-user";
// const templateId = "gym-template-1";

// // 📥 Get Navbar Items
// export const getNavbar = async (_req: Request, res: Response) => {
//   try {
//     const navbar = await Navbar.findOne({ userId, templateId });
//     res.status(200).json(navbar?.items || []);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch navbar items" });
//   }
// };

// // 💾 Save Full Navbar Items (overwrite all)
// export const saveNavbar = async (req: Request, res: Response) => {
//   const { items } = req.body;
//   if (!Array.isArray(items)) return res.status(400).json({ error: "Invalid format" });

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
// export const addNavbarItem = async (req: Request, res: Response) => {
//   const { label, href, type = "link", dropdown = false, children = [] } = req.body;

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
//             children, // ✅ Add children if provided
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


// // ❌ Delete Navbar Item by Label
// // ➖ Delete Navbar Item by ID
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
// export const editNavbarItem = async (req: Request, res: Response) => {
//   const { userId, templateId, itemId } = req.params;
//   const { label, href, type = "link", dropdown = false, children = [] } = req.body;

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

//     res.status(200).json({ message: "Navbar reordered", items: navbar?.items || [] });
//   } catch (err) {
//     console.error("❌ Reorder failed:", err);
//     res.status(500).json({ error: "Failed to reorder navbar items" });
//   }
// };


import { Request, Response } from "express";
import Navbar from "../models/Navbar";
import Section from "../models/section.model";

// 📥 Get Navbar Items
export const getNavbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  try {
    const navbar = await Navbar.findOne({ userId, templateId });
    res.status(200).json(navbar?.items || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch navbar items" });
  }
};

// 💾 Save Full Navbar Items (overwrite all)
export const saveNavbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { items } = req.body;
  if (!Array.isArray(items))
    return res.status(400).json({ error: "Invalid format" });

  try {
    const updated = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { items },
      { upsert: true, new: true }
    );
    res.status(200).json(updated.items);
  } catch (err) {
    res.status(500).json({ error: "Failed to save navbar items" });
  }
};

// ➕ Add Navbar Item
export const addNavbarItem = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { label, href, type = "link", dropdown = false, children = [] } =
    req.body;

  if (!label || !href) {
    return res.status(400).json({ error: "Label and href are required" });
  }

  try {
    const result = await Navbar.findOneAndUpdate(
      { userId, templateId },
      {
        $push: {
          items: {
            label,
            href,
            type,
            dropdown,
            children,
          },
        },
      },
      { new: true, upsert: true }
    );

    const newlyAddedItem = result?.items[result.items.length - 1];
    res.status(201).json(newlyAddedItem);
  } catch (err) {
    console.error("❌ Add navbar item failed:", err);
    res.status(500).json({ error: "Failed to add navbar item" });
  }
};

// ❌ Delete Navbar Item
export const deleteNavbarItem = async (req: Request, res: Response) => {
  const { userId, templateId, itemId } = req.params;

  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    const updated = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    res.status(200).json({
      message: "Navbar item deleted",
      items: updated?.items || [],
    });
  } catch (err) {
    console.error("❌ Delete navbar item failed:", err);
    res.status(500).json({ error: "Failed to delete navbar item" });
  }
};

// ✏️ Edit Navbar Item
export const editNavbarItem = async (req: Request, res: Response) => {
  const { userId, templateId, itemId } = req.params;
  const { label, href, type = "link", dropdown = false, children = [] } =
    req.body;

  if (!label || !href) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const navbar = await Navbar.findOneAndUpdate(
      {
        userId,
        templateId,
        "items._id": itemId,
      },
      {
        $set: {
          "items.$.label": label,
          "items.$.href": href,
          "items.$.type": type,
          "items.$.dropdown": dropdown,
          "items.$.children": children,
        },
      },
      { new: true }
    );

    if (!navbar) {
      return res.status(404).json({ error: "Navbar or item not found" });
    }

    res.status(200).json({ message: "Item updated", items: navbar.items });
  } catch (err) {
    console.error("❌ Edit failed:", err);
    res.status(500).json({ error: "Failed to update navbar item" });
  }
};

// 🔃 Reorder Navbar Items
export const reorderNavbarItems = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { reorderedItems } = req.body;

  if (!Array.isArray(reorderedItems)) {
    return res.status(400).json({ error: "Invalid format" });
  }

  try {
    const navbar = await Navbar.findOneAndUpdate(
      { userId, templateId },
      { items: reorderedItems },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Navbar reordered", items: navbar?.items || [] });
  } catch (err) {
    console.error("❌ Reorder failed:", err);
    res.status(500).json({ error: "Failed to reorder navbar items" });
  }
};

// ➕ Create Section (and optionally add to Navbar if page)
export const createSection = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { title, slug, type, content } = req.body;

  try {
    const newSection = await Section.create({
      userId,
      templateId,
      title,
      slug,
      type,
      content,
    });

    // ✅ Auto-add to Navbar if it's a new PAGE
    if (type === "page") {
      const exists = await Navbar.findOne({
        userId,
        templateId,
        "items.href": slug,
      });

      if (!exists) {
        await Navbar.findOneAndUpdate(
          { userId, templateId },
          {
            $push: {
              items: {
                label: title,
                href: slug,
                type: "link",
                dropdown: false,
                children: [],
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(201).json(newSection);
  } catch (err) {
    console.error("❌ Section creation failed:", err);
    res.status(500).json({ error: "Failed to create section" });
  }
};



