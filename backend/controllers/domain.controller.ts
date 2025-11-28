// backend/controllers/domain.controller.ts
import { Request, Response } from "express";

const { DOMAIN_NAME, DOMAIN_URL, DOMAIN_EXPIRY } = process.env;

/**
 * GET /api/domain/me
 * Returns domain info for the current environment.
 * Currently global (not per-user) and based on env variables.
 */
export async function getDomainInfo(req: Request, res: Response) {
  try {
    if (!DOMAIN_NAME || !DOMAIN_URL) {
      return res.status(404).json({
        message: "Domain not configured on server (DOMAIN_NAME / DOMAIN_URL missing)",
      });
    }

    let expiresAt: Date | null = null;
    let daysLeft: number | null = null;
    let status: "active" | "expiring_soon" | "expired" | "unknown" = "unknown";

    if (DOMAIN_EXPIRY && DOMAIN_EXPIRY.trim() !== "") {
      const d = new Date(DOMAIN_EXPIRY);
      if (!isNaN(d.getTime())) {
        expiresAt = d;

        const now = new Date();
        const diffMs = d.getTime() - now.getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          status = "expired";
        } else if (daysLeft <= 30) {
          status = "expiring_soon";
        } else {
          status = "active";
        }
      } else {
        // Invalid date format in env
        status = "unknown";
      }
    } else {
      // No expiry set
      status = "unknown";
    }

    return res.json({
      domain: DOMAIN_NAME,
      siteUrl: DOMAIN_URL,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      daysLeft,
      status,
    });
  } catch (err) {
    console.error("getDomainInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
