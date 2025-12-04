// backend/controllers/analytics.controller.ts
import { Request, Response } from "express";
import TemplateVisit from "../models/TemplateVisit";

function todayYmd() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * POST /api/analytics/visit/:userId/:templateId
 * Body (optional): { page?: string, referrer?: string }
 */
export async function trackVisit(req: Request, res: Response) {
  try {
    const { userId, templateId } = req.params;
    const { page, referrer } = req.body || {};

    if (!userId || !templateId) {
      return res.status(400).json({ error: "userId and templateId are required" });
    }

    const date = todayYmd();

    const doc = await TemplateVisit.findOneAndUpdate(
      { userId, templateId, date },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          page: page || "",
          referrer: referrer || "",
        },
      },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, visit: doc });
  } catch (err) {
    console.error("trackVisit error:", err);
    return res.status(500).json({ error: "Failed to track visit" });
  }
}

/**
 * GET /api/analytics/summary/:userId/:templateId
 * Optional query: ?from=2025-01-01&to=2025-12-31
 */
export async function getVisitSummary(req: Request, res: Response) {
  try {
    const { userId, templateId } = req.params;
    const { from, to } = req.query as { from?: string; to?: string };

    if (!userId || !templateId) {
      return res.status(400).json({ error: "userId and templateId are required" });
    }

    const match: any = { userId, templateId };

    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }

    const docs = await TemplateVisit.find(match).sort({ date: 1 }).lean();

    const total = docs.reduce((sum, d) => sum + (d.count || 0), 0);

    return res.json({
      userId,
      templateId,
      totalVisitors: total,
      days: docs,
    });
  } catch (err) {
    console.error("getVisitSummary error:", err);
    return res.status(500).json({ error: "Failed to get visit summary" });
  }
}
