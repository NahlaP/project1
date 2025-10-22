// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Marquee from "../models/Marquee";
// import { TemplateModel } from "../models/Template";

// dotenv.config();

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// type RawItem = string | { text?: any; icon?: any };

// function normalizeItems(input: RawItem[] | undefined): { text: string; icon?: string }[] {
//   if (!Array.isArray(input)) return [];
//   return input.map((it) => {
//     if (typeof it === "string") return { text: it, icon: "*" };
//     return {
//       text: typeof it?.text === "string" ? it.text : "",
//       icon: typeof it?.icon === "string" ? it.icon : "*",
//     };
//   }).filter((x) => x.text.trim().length > 0);
// }

// /** GET /api/marquee/:userId/:templateId */
// export const getMarquee = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) User override
//     const doc = await Marquee.findOne({ userId, templateId }).lean();
//     if (doc && (doc.items?.length || 0) > 0) {
//       return res.json({ _source: "user", items: doc.items });
//     }

//     // 2) Template fallback (look in defaultSections[type="marquee"])
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => String(s?.type).toLowerCase() === "marquee")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     const fromTpl = normalizeItems(fallback?.content?.items);
//     if (fromTpl.length) return res.json({ _source: "template", items: fromTpl });

//     // 3) Hard default if template had none
//     const hard = normalizeItems([
//       "UI-UX Experience",
//       "Web Development",
//       "Digital Marketing",
//       "Product Design",
//       "Mobile Solutions",
//     ]);
//     return res.json({ _source: "default", items: hard });
//   } catch (e) {
//     console.error("getMarquee error:", e);
//     return res.status(500).json({ error: "Failed to fetch marquee" });
//   }
// };

// /** PUT /api/marquee/:userId/:templateId */
// export const upsertMarquee = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const items = normalizeItems((req.body || {}).items);

//     if (!items.length) {
//       return res.status(400).json({ error: "Items must be a non-empty array" });
//     }

//     const doc = await Marquee.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Marquee saved", count: doc.items.length });
//   } catch (e) {
//     console.error("upsertMarquee error:", e);
//     return res.status(500).json({ error: "Failed to save marquee" });
//   }
// };






// // work with defualt
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Marquee from "../models/Marquee";
// import { TemplateModel } from "../models/Template";

// dotenv.config();

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// type RawItem = string | { text?: any; icon?: any };

// function normalizeItems(
//   input: RawItem[] | undefined
// ): { text: string; icon?: string }[] {
//   if (!Array.isArray(input)) return [];
//   return input
//     .map((it) => {
//       if (typeof it === "string") return { text: it, icon: "*" };
//       return {
//         text: typeof it?.text === "string" ? it.text : "",
//         icon: typeof it?.icon === "string" ? it.icon : "*",
//       };
//     })
//     .filter((x) => x.text.trim().length > 0);
// }

// /** GET /api/marquee/:userId/:templateId */
// export const getMarquee = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) User override
//     const doc = await Marquee.findOne({ userId, templateId }).lean();
//     if (doc && (doc.items?.length || 0) > 0) {
//       return res.json({ _source: "user", items: doc.items });
//     }

//     // 2) Template fallback (look in defaultSections[type="marquee"])
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections)
//       ? tpl.defaultSections
//       : [];
//     const fallback = defaults
//       .filter((s: any) => String(s?.type).toLowerCase() === "marquee")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     const fromTpl = normalizeItems(fallback?.content?.items);
//     if (fromTpl.length) return res.json({ _source: "template", items: fromTpl });

//     // 3) Hard default if template had none
//     const hard = normalizeItems([
//       "UI-UX Experience",
//       "Web Development",
//       "Digital Marketing",
//       "Product Design",
//       "Mobile Solutions",
//     ]);
//     return res.json({ _source: "default", items: hard });
//   } catch (e) {
//     console.error("getMarquee error:", e);
//     return res.status(500).json({ error: "Failed to fetch marquee" });
//   }
// };

// /** PUT /api/marquee/:userId/:templateId */
// export const upsertMarquee = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const items = normalizeItems((req.body || {}).items);

//     if (!items.length) {
//       return res.status(400).json({ error: "Items must be a non-empty array" });
//     }

//     const doc = await Marquee.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Marquee saved", count: doc.items.length });
//   } catch (e) {
//     console.error("upsertMarquee error:", e);
//     return res.status(500).json({ error: "Failed to save marquee" });
//   }
// };

// /** POST /api/marquee/:userId/:templateId/reset
//  *  Delete user override so GET falls back to template/hardcoded
//  */
// export const resetMarquee = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await Marquee.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetMarquee error:", e);
//     return res.status(500).json({ error: "Failed to reset marquee" });
//   }
// };





// backend/controllers/marquee.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Marquee from "../models/Marquee";
import { TemplateModel } from "../models/TemplateV";

dotenv.config();

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

type RawItem = string | { text?: any; icon?: any };

function normalizeItems(
  input: RawItem[] | undefined,
  fallbackIcon: string = "*"
): { text: string; icon?: string }[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((it) => {
      if (typeof it === "string") return { text: it, icon: fallbackIcon };
      const text = typeof it?.text === "string" ? it.text : "";
      const icon = typeof it?.icon === "string" ? it.icon : fallbackIcon;
      return { text, icon };
    })
    .filter((x) => x.text.trim().length > 0);
}

/** Pull defaults from TemplateV (handles rows[] and items[]) */
function pickVersionDefaults(tpl: any, verTag?: string) {
  const chosen =
    (verTag && tpl?.versions?.find((v: any) => v.tag === verTag)) ||
    (tpl?.currentTag && tpl?.versions?.find((v: any) => v.tag === tpl.currentTag)) ||
    tpl?.versions?.[0];

  const defaults = Array.isArray(chosen?.defaultSections)
    ? chosen.defaultSections
    : [];

  const section = defaults
    .filter((s: any) => String(s?.type || "").toLowerCase() === "marquee")
    .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

  if (!section) return { items: [], icon: "*", tag: chosen?.tag || undefined };

  const c = section.content || {};
  const iconDefault =
    typeof c.icon === "string" && c.icon.trim() ? c.icon.trim() : "*";

  // Accept either flat items[] or rows[][]
  if (Array.isArray(c.items)) {
    return {
      items: normalizeItems(c.items, iconDefault),
      icon: iconDefault,
      tag: chosen?.tag || undefined,
    };
  }

  if (Array.isArray(c.rows)) {
    // rows can be array of arrays (strings or objects)
    const flat: RawItem[] = [];
    for (const row of c.rows as any[]) {
      if (Array.isArray(row)) {
        for (const cell of row) flat.push(cell as RawItem);
      } else if (row != null) {
        flat.push(row as RawItem);
      }
    }
    return {
      items: normalizeItems(flat, iconDefault),
      icon: iconDefault,
      tag: chosen?.tag || undefined,
    };
  }

  return { items: [], icon: iconDefault, tag: chosen?.tag || undefined };
}

/* ---------------- controllers ---------------- */

/** GET /api/marquee/:userId/:templateId */
export const getMarquee = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag =
      String((req.query?.ver ?? "") as string).trim() || undefined;

    // 1) User override
    const doc = await Marquee.findOne({ userId, templateId }).lean();
    if (doc && (doc.items?.length || 0) > 0) {
      return res.json({ _source: "user", items: doc.items });
    }

    // 2) TemplateV defaults (version-aware)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    if (tpl) {
      const v = pickVersionDefaults(tpl, verTag);
      if (v.items.length) {
        return res.json({
          _source: "template",
          versionTag: v.tag || "v1",
          items: v.items,
        });
      }
    }

    // 3) Hard default if template had none
    const hard = normalizeItems(
      [
        "UI-UX Experience",
        "Web Development",
        "Digital Marketing",
        "Product Design",
        "Mobile Solutions",
      ],
      "*"
    );
    return res.json({ _source: "default", items: hard });
  } catch (e) {
    console.error("getMarquee error:", e);
    return res.status(500).json({ error: "Failed to fetch marquee" });
  }
};

/** PUT /api/marquee/:userId/:templateId */
export const upsertMarquee = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const items = normalizeItems((req.body || {}).items);

    if (!items.length) {
      return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    const doc = await Marquee.findOneAndUpdate(
      { userId, templateId },
      { $set: { items } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: "✅ Marquee saved", count: doc.items.length });
  } catch (e) {
    console.error("upsertMarquee error:", e);
    return res.status(500).json({ error: "Failed to save marquee" });
  }
};

/** POST /api/marquee/:userId/:templateId/reset
 *  Delete user override so GET falls back to template/hardcoded
 */
export const resetMarquee = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await Marquee.deleteMany({ userId, templateId });
    return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
  } catch (e) {
    console.error("resetMarquee error:", e);
    return res.status(500).json({ error: "Failed to reset marquee" });
  }
};
