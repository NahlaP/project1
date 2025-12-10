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




























import { Request, Response } from "express";

/* ---------- ResellerClub config ---------- */

const RC_BASE =
  process.env.RESELLERCLUB_API_BASE || "https://httpapi.com/api";
const RC_USERID = process.env.RESELLERCLUB_AUTH_USERID || "";
const RC_APIKEY = process.env.RESELLERCLUB_API_KEY || "";

/**
 * You already had this helper in your ResellerClub code.
 * I’m duplicating it here so this file stays standalone.
 * The env values are the “productkey” values from ResellerClub.
 */
function getProductKeyForTld(tld: string): string | null {
  const clean = tld.replace(/^\./, "").toLowerCase();

  const envMap: Record<string, string | undefined> = {
    com: process.env.RESELLERCLUB_TLDKEY_COM,
    net: process.env.RESELLERCLUB_TLDKEY_NET,
    org: process.env.RESELLERCLUB_TLDKEY_ORG,
    info: process.env.RESELLERCLUB_TLDKEY_INFO,
    store: process.env.RESELLERCLUB_TLDKEY_STORE,
    online: process.env.RESELLERCLUB_TLDKEY_ONLINE,
    ae: process.env.RESELLERCLUB_TLDKEY_AE,
  };

  const key = envMap[clean];
  if (!key) {
    console.error("[ResellerClub] No product-key configured for TLD:", clean);
    return null;
  }

  return key;
}

/**
 * Small helper: get ".com" from "example.com", etc.
 */
function extractTld(domain: string): string | null {
  const parts = domain.toLowerCase().split(".");
  if (parts.length < 2) return null;
  return parts[parts.length - 1]; // "com", "ae", ...
}

/**
 * Call ResellerClub “customer-price.json” and return the transfer price
 * for this domain’s TLD (1 year).
 *
 * DOC: products/customer-price.json :contentReference[oaicite:0]{index=0}
 */
async function fetchTransferPriceForDomain(
  domain: string
): Promise<number | null> {
  if (!RC_USERID || !RC_APIKEY) {
    console.warn("[DomainTransfer] Missing ResellerClub creds");
    return null;
  }

  const tld = extractTld(domain);
  if (!tld) return null;

  const productKey = getProductKeyForTld(tld);
  if (!productKey) return null;

  const url = `${RC_BASE}/products/customer-price.json?auth-userid=${encodeURIComponent(
    RC_USERID
  )}&api-key=${encodeURIComponent(RC_APIKEY)}`;

  try {
    // Node 18+ has global fetch. If you’re on older Node,
    // install node-fetch and import it.
    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        "[ResellerClub] customer-price HTTP error",
        res.status,
        await res.text()
      );
      return null;
    }

    const json: any = await res.json();
    const tldPricing = json[productKey];

    if (!tldPricing) {
      console.error(
        "[ResellerClub] No pricing found for productKey",
        productKey
      );
      return null;
    }

    // For domains, the action name for transfer is “addtransferdomain”
    // structure: { "addtransferdomain": { "1": "19.97", "2": "..." }, ... }
    const transferMap = tldPricing["addtransferdomain"];
    if (!transferMap) {
      console.error(
        "[ResellerClub] No addtransferdomain entry for productKey",
        productKey
      );
      return null;
    }

    const oneYear = transferMap["1"];
    if (!oneYear) return null;

    const amount = parseFloat(`${oneYear}`);
    if (Number.isNaN(amount)) return null;

    return amount;
  } catch (err) {
    console.error("[ResellerClub] fetchTransferPriceForDomain error", err);
    return null;
  }
}

/* ---------- Controllers ---------- */

export async function submitDomainTransfer(req: Request, res: Response) {
  try {
    const { domain, eppCode } = req.body || {}; // front-end sends eppCode

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "domain is required" });
    }

    if (!eppCode || typeof eppCode !== "string") {
      return res
        .status(400)
        .json({ error: "EPP / auth code (eppCode) is required" });
    }

    const userId = (req as any).user?.id || null; // from requireAuth middleware

    // 1) Log transfer request
    console.log("[DomainTransfer] New transfer request", {
      userId,
      domain,
      eppCode,
    });

    // 2) Fetch transfer price from ResellerClub (optional)
    const transferPrice = await fetchTransferPriceForDomain(domain);

    return res.json({
      ok: true,
      message: "Transfer request received. We will process it and update you.",
      data: {
        userId,
        domain,
        transferPrice, // e.g. 19.97 (your Reseller currency)
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

    const userId = (req as any).user?.id || null;

    console.log("[DomainTransfer] DNS-only domain attached", {
      userId,
      domain,
    });

    return res.json({
      ok: true,
      message:
        "Domain saved. Please update your DNS records to point to ION7.",
      data: {
        userId,
        domain,
      },
    });
  } catch (err) {
    console.error("DNS-only domain error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
