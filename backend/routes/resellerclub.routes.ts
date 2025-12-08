// backend/routes/resellerclub.routes.ts
import { Router, Request, Response } from "express";
import {
  checkDomainAvailability,
  getDomainQuote,
} from "../services/resellerclub.service";

const router = Router();

/**
 * 1) PURE AVAILABILITY
 * GET /api/resellerclub/domain/check?name=mybrand&tlds=com,net,ae
 */
router.get("/domain/check", async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string | undefined)?.trim();
    const tldsParam = (req.query.tlds as string | undefined) || "com";

    if (!name) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'name' query param" });
    }

    const tlds = tldsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = await checkDomainAvailability(name, tlds);

    res.json({ ok: true, data });
  } catch (err: any) {
    console.error("[ResellerClub Domain Check] Error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Domain check failed",
    });
  }
});

/**
 * 2) AVAILABILITY + PRICE + “FREE UP TO 50 AED”
 * GET /api/resellerclub/domain/quote?name=mybrand&tld=com
 */
router.get("/domain/quote", async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string | undefined)?.trim();
    const tldParam = (req.query.tld as string | undefined) || "com";

    if (!name) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'name' query param" });
    }

    const quote = await getDomainQuote(name, tldParam);

    res.json({ ok: true, data: quote });
  } catch (err: any) {
    console.error("[ResellerClub Domain Quote] Error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Domain quote failed",
    });
  }
});

export default router;
