// backend/controllers/domaintransfer.controller.ts
import { Request, Response } from "express";
import User from "../models/User";

interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function saveTransferDomain(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Adjust depending on your auth middleware
    const userId = req.userId || req.user?._id || req.user?.id;

    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    // Expecting body: { domain: "mydomain.com", eppCode: "AUTH/EPP CODE" }
    const { domain, eppCode } = req.body as {
      domain?: string;
      eppCode?: string;
    };

    const d = (domain || "").trim().toLowerCase();
    const code = (eppCode || "").trim();

    if (!d) {
      res.status(400).json({ ok: false, error: "Domain is required" });
      return;
    }

    if (!code) {
      res.status(400).json({ ok: false, error: "EPP / Auth code is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    // Store transfer details on user
    user.domainMode = "transfer";
    user.domainName = d;
    user.domainEppCode = code;

    await user.save();

    res.json({
      ok: true,
      data: {
        domainMode: user.domainMode,
        domainName: user.domainName,
      },
    });
  } catch (err: any) {
    console.error("[DomainTransfer] Error saving transfer domain:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Failed to save transfer domain",
    });
  }
}
