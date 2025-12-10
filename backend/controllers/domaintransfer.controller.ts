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

// Small helper to safely read userId from req
function getUserId(req: Request): string | null {
  const anyReq = req as any;

  return (
    anyReq.user?.id ||                      // ✅ same pattern as other controllers
    (anyReq.user?._id?.toString
      ? anyReq.user._id.toString()
      : anyReq.user?._id) ||               // in case you stored _id
    anyReq.userId ||                        // fallback if middleware set userId directly
    null
  );
}

export async function submitDomainTransfer(req: Request, res: Response) {
  try {
    const { domain, authCode } = req.body || {};

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }
    if (!authCode || typeof authCode !== "string") {
      return res.status(400).json({ error: "authCode is required" });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized – user not found.",
      });
    }

    const cleanDomain = domain.trim().toLowerCase();

    console.log("[DomainTransfer] New transfer request", {
      userId,
      domain: cleanDomain,
      // NOTE: do NOT log authCode for security
    });

    // TODO: later: call ResellerClub API to actually start transfer

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

export async function saveDnsOnlyDomain(req: Request, res: Response) {
  try {
    const { domain } = req.body || {};
    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized – user not found.",
      });
    }

    const cleanDomain = domain.trim().toLowerCase();

    console.log("[DomainTransfer] DNS-only domain attached", {
      userId,
      domain: cleanDomain,
    });

    // TODO: later: save to Domain model so widget can show it

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
