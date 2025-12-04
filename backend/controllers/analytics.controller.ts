// backend/controllers/analytics.controller.ts
import { Request, Response } from "express";
import { Visitor } from "../models/Visitor"; // same model you used in visitor.controller

type AuthedReq = Request & {
  user?: { id?: string; userId?: string };
};

/**
 * PUBLIC
 * POST /api/analytics/visit/:userId/:templateId
 * Called from S3 templates via PHP proxy (no auth cookie needed)
 */
export async function recordVisit(req: Request, res: Response) {
  try {
    const { userId: uidParam, templateId: tplParam } = req.params as {
      userId?: string;
      templateId?: string;
    };

    const {
      visitorId,
      userId: bodyUid,
      templateId: bodyTpl,
      page,
      referrer,
      userAgent: uaOverride,
    } = (req.body || {}) as {
      visitorId?: string;
      userId?: string;
      templateId?: string;
      page?: string;
      referrer?: string;
      userAgent?: string;
    };

    const userId = uidParam || bodyUid;
    const templateId = tplParam || bodyTpl;

    if (!userId || !templateId || !visitorId) {
      // Never break public site – just skip
      return res.status(200).json({ ok: true, skipped: true });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const userAgent = uaOverride || (req.headers["user-agent"] as string) || "unknown";

    // ✅ DEDUPE: one row per (userId, templateId, visitorId, ip, day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Visitor.findOne({
      userId,
      templateId,
      visitorId,
      ip,
      createdAt: { $gte: today },
    }).lean();

    if (existing) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    await Visitor.create({
      userId,
      templateId,
      visitorId,
      ip,
      userAgent,
      path: page || null,
      referrer: referrer || null,
      createdAt: new Date(),
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("recordVisit error", err);
    return res.status(200).json({ ok: false });
  }
}

/**
 * AUTH REQUIRED
 * GET /api/analytics/summary/:userId/:templateId?days=30
 * Used by dashboard "Site Visitors" widget
 */
export async function getVisitSummary(req: AuthedReq, res: Response) {
  try {
    const { userId: uidParam, templateId: tplParam } = req.params as {
      userId?: string;
      templateId?: string;
    };

    // you already auth via middleware; but we still honor the param
    const authedUser =
      req.user?.id ||
      req.user?.userId ||
      (req as any).userId ||
      (req.query.userId as string | undefined) ||
      uidParam;

    const templateId = tplParam || (req.query.templateId as string | undefined);

    if (!authedUser || !templateId) {
      return res
        .status(400)
        .json({ ok: false, error: "userId and templateId are required" });
    }

    const days = Number(req.query.days ?? 30);
    const windowDays = Number.isFinite(days) && days > 0 ? days : 30;

    const since = new Date();
    since.setDate(since.getDate() - windowDays);
    since.setHours(0, 0, 0, 0);

    // Fetch all visits for this user+template in the window
    const docs = await Visitor.find({
      userId: authedUser,
      templateId,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .lean();

    const byDay: Record<string, number> = {};

    for (const v of docs) {
      if (!v.createdAt) continue;
      const d = new Date(v.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay[key] = (byDay[key] || 0) + 1;
    }

    const labels = Object.keys(byDay).sort();
    const daysArray = labels.map((date) => ({
      date,
      count: byDay[date],
    }));

    const totalVisitors = daysArray.reduce((sum, d) => sum + d.count, 0);

    return res.json({
      ok: true,
      data: {
        totalVisitors,
        days: daysArray,
      },
    });
  } catch (err) {
    console.error("getVisitSummary error", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to load analytics summary",
    });
  }
}
