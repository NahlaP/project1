// backend/controllers/visitor.controller.ts
import { Request, Response } from "express";
import Visitor from "../models/Visitor";

function getClientIp(req: Request): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  if (xf) return xf.split(",")[0].trim();
  // fallback to Express ip
  return (req.ip || req.socket.remoteAddress || "unknown").toString();
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function calculatePercentageChange(prev: number, current: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  const diff = ((current - prev) / prev) * 100;
  return Math.round(diff * 10) / 10;
}

/* -------------------------------- TRACK ---------------------------------- */
/**
 * POST /api/visitors/track
 * body: { visitorId: string, appUserId: string, templateId?: string }
 *
 * Counts ONE unique visit per (day, appUserId, templateId, visitorId, ip)
 */
export async function trackVisitor(req: Request, res: Response) {
  try {
    const { visitorId, appUserId, templateId } = req.body || {};

    if (!visitorId || !appUserId) {
      return res.status(400).json({
        ok: false,
        error: "visitorId and appUserId are required",
      });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    const todayStart = startOfDay(new Date());

    const existing = await Visitor.findOne({
      appUserId,
      templateId: templateId || null,
      visitorId,
      ip,
      createdAt: { $gte: todayStart },
    }).lean();

    if (existing) {
      return res.json({ ok: true, counted: false, reason: "already-today" });
    }

    await Visitor.create({
      appUserId,
      templateId: templateId || null,
      visitorId,
      ip,
      userAgent,
    });

    return res.json({ ok: true, counted: true });
  } catch (err: any) {
    console.error("[trackVisitor] error", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Failed to track visitor",
    });
  }
}

/* ------------------------------ SUMMARY ---------------------------------- */
/**
 * GET /api/visitors/summary?appUserId=...&templateId=...
 *
 * Returns:
 * {
 *   ok: true,
 *   visitors: {
 *     currentMonth: number,
 *     previousMonth: number,
 *     percentChange: number,
 *     series: { label: string, count: number }[]
 *   }
 * }
 */
export async function visitorsSummary(req: Request, res: Response) {
  try {
    const appUserId = (req.query.appUserId as string) || "";
    const templateId = (req.query.templateId as string) || undefined;

    if (!appUserId) {
      return res.status(400).json({
        ok: false,
        error: "appUserId is required",
      });
    }

    const now = new Date();
    const startCurrent = startOfMonth(now);
    const startPrev = startOfMonth(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );

    // Counts for prev & current month
    const [currentMonth, previousMonth, dailyAgg] = await Promise.all([
      Visitor.countDocuments({
        appUserId,
        ...(templateId ? { templateId } : {}),
        createdAt: { $gte: startCurrent },
      }),
      Visitor.countDocuments({
        appUserId,
        ...(templateId ? { templateId } : {}),
        createdAt: { $gte: startPrev, $lt: startCurrent },
      }),
      Visitor.aggregate([
        {
          $match: {
            appUserId,
            ...(templateId ? { templateId } : {}),
            createdAt: { $gte: startCurrent },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const percentChange = calculatePercentageChange(
      previousMonth,
      currentMonth
    );

    const series = (dailyAgg || []).map((row: any) => ({
      label: row._id as string, // "2025-11-25"
      count: row.count as number,
    }));

    return res.json({
      ok: true,
      visitors: {
        currentMonth,
        previousMonth,
        percentChange,
        series,
      },
    });
  } catch (err: any) {
    console.error("[visitorsSummary] error", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Failed to load visitors summary",
    });
  }
}
