// backend/controllers/visitor.controller.ts
import { Request, Response } from "express";
import { Visitor } from "../models/Visitor";

/**
 * PUBLIC
 * POST /api/visitors/track
 * Called from S3 templates → NO AUTH
 */
export async function trackVisitor(req: Request, res: Response) {
  try {
    const {
      visitorId,
      userId,
      templateId,
      path,
      userAgent: uaOverride,
    } = req.body;

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const userAgent = uaOverride || req.headers["user-agent"] || "unknown";

    // must have at least a visitorId + userId
    if (!visitorId || !userId) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    await Visitor.create({
      visitorId,
      ip,
      userAgent,
      userId,
      templateId: templateId || null,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("trackVisitor error", err);
    // never break the public site
    return res.status(200).json({ ok: false });
  }
}

/**
 * AUTH REQUIRED
 * GET /api/visitors/stats
 * Used by dashboard "Site Visitors" widget
 */
export async function getVisitorStats(req: Request, res: Response) {
  try {
    // same pattern as your other widgets (current-subscription, my-products)
    const authedUser =
      (req as any).user?.id ||
      (req as any).user?.userId ||
      (req as any).userId ||
      (req.query.userId as string | undefined);

    if (!authedUser) {
      return res.status(400).json({ ok: false, error: "userId is required" });
    }

    const days = Number(req.query.days ?? 30);
    const windowDays = Number.isFinite(days) && days > 0 ? days : 30;

    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    // 🔹 SIMPLE: fetch docs and group in Node (no fancy Mongo operators)
    const docs = await Visitor.find({
      userId: authedUser,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .lean();

    const byDay: Record<string, number> = {};

    for (const v of docs) {
      if (!v.createdAt) continue;
      const d = new Date(v.createdAt);
      if (Number.isNaN(d.getTime())) continue;

      const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      byDay[key] = (byDay[key] || 0) + 1;
    }

    const labels = Object.keys(byDay).sort();
    const values = labels.map((k) => byDay[k]);
    const total = values.reduce((a, b) => a + b, 0);

    return res.json({
      ok: true,
      data: { labels, values, total },
    });
  } catch (err) {
    console.error("getVisitorStats error", err);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to load visitor stats" });
  }
}
