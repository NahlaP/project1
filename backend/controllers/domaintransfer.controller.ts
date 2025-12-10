// // backend/controllers/domaintransfer.controller.ts
// import { Request, Response } from "express";

// export async function submitDomainTransfer(req: Request, res: Response) {
//   try {
//     const { domain, authCode } = req.body || {};

//     if (!domain || typeof domain !== "string") {
//       return res.status(400).json({ error: "domain is required" });
//     }
//     if (!authCode || typeof authCode !== "string") {
//       return res.status(400).json({ error: "authCode is required" });
//     }

//     const userId = (req as any).userId || null; // requireAuth usually sets this

//     console.log("[DomainTransfer] New transfer request", {
//       userId,
//       domain,
//       authCode,
//     });

//     // TODO: In future: call ResellerClub API to actually start transfer.
//     // For now we just acknowledge and maybe you handle manually.

//     return res.json({
//       ok: true,
//       message: "Transfer request received. We will process it and update you.",
//       data: {
//         userId,
//         domain,
//       },
//     });
//   } catch (err) {
//     console.error("Domain transfer error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// export async function saveDnsOnlyDomain(req: Request, res: Response) {
//   try {
//     const { domain } = req.body || {};
//     if (!domain || typeof domain !== "string") {
//       return res.status(400).json({ error: "domain is required" });
//     }

//     const userId = (req as any).userId || null;

//     console.log("[DomainTransfer] DNS-only domain attached", {
//       userId,
//       domain,
//     });

//     // TODO: In future: save to a Domain model so the widget can show it.

//     return res.json({
//       ok: true,
//       message:
//         "Domain saved. Please update your DNS records to point to ION7.",
//       data: {
//         userId,
//         domain,
//       },
//     });
//   } catch (err) {
//     console.error("DNS-only domain error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }




























// backend/controllers/domaintransfer.controller.ts
import { Request, Response } from "express";

/**
 * Small helper to safely read userId from the request.
 * `requireAuth` usually sets `req.user = { id, email, ... }`
 */
function extractUserId(req: Request): string | null {
  const r: any = req;

  if (r.user?.id) return String(r.user.id);
  if (r.user?.userId) return String(r.user.userId);
  if (r.user?._id) {
    return r.user._id.toString ? r.user._id.toString() : String(r.user._id);
  }
  if (r.userId) return String(r.userId);

  return null;
}

/**
 * POST /api/domain/transfer
 * Body: { domain: string, eppCode: string }
 */
export async function submitDomainTransfer(req: Request, res: Response) {
  try {
    const { domain, eppCode } = (req.body || {}) as {
      domain?: string;
      eppCode?: string;
    };

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }
    if (!eppCode || typeof eppCode !== "string") {
      return res
        .status(400)
        .json({ error: "EPP / auth code (eppCode) is required" });
    }

    const userId = extractUserId(req);
    const cleanDomain = domain.trim().toLowerCase();

    console.log("[DomainTransfer] New transfer request", {
      userId,
      domain: cleanDomain,
      eppCode,
    });

    // TODO: later call ResellerClub API to really start the transfer.

    return res.json({
      ok: true,
      message: "Transfer request received. We will process it and update you.",
      data: {
        userId,
        domain: cleanDomain,
      },
    });
  } catch (err) {
    console.error("Domain transfer error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/domain/dns
 * Body: { domain: string }
 * Used for "Use existing (DNS)" option.
 */
export async function saveDnsOnlyDomain(req: Request, res: Response) {
  try {
    const { domain } = (req.body || {}) as { domain?: string };

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }

    const userId = extractUserId(req);
    const cleanDomain = domain.trim().toLowerCase();

    console.log("[DomainTransfer] DNS-only domain attached", {
      userId,
      domain: cleanDomain,
    });

    // TODO: later save to a Domain model so the domain widget can show it.

    return res.json({
      ok: true,
      message:
        "Domain saved. Please update your DNS records to point to ION7.",
      data: {
        userId,
        domain: cleanDomain,
      },
    });
  } catch (err) {
    console.error("DNS-only domain error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
