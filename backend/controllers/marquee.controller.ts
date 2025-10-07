import { Request, Response } from "express";
import dotenv from "dotenv";
import Marquee from "../models/Marquee";
import { TemplateModel } from "../models/Template";

dotenv.config();

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

type RawItem = string | { text?: any; icon?: any };

function normalizeItems(input: RawItem[] | undefined): { text: string; icon?: string }[] {
  if (!Array.isArray(input)) return [];
  return input.map((it) => {
    if (typeof it === "string") return { text: it, icon: "*" };
    return {
      text: typeof it?.text === "string" ? it.text : "",
      icon: typeof it?.icon === "string" ? it.icon : "*",
    };
  }).filter((x) => x.text.trim().length > 0);
}

/** GET /api/marquee/:userId/:templateId */
export const getMarquee = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) User override
    const doc = await Marquee.findOne({ userId, templateId }).lean();
    if (doc && (doc.items?.length || 0) > 0) {
      return res.json({ _source: "user", items: doc.items });
    }

    // 2) Template fallback (look in defaultSections[type="marquee"])
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
    const fallback = defaults
      .filter((s: any) => String(s?.type).toLowerCase() === "marquee")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    const fromTpl = normalizeItems(fallback?.content?.items);
    if (fromTpl.length) return res.json({ _source: "template", items: fromTpl });

    // 3) Hard default if template had none
    const hard = normalizeItems([
      "UI-UX Experience",
      "Web Development",
      "Digital Marketing",
      "Product Design",
      "Mobile Solutions",
    ]);
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
