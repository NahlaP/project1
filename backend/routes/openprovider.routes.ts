

// // backend/routes/openprovider.routes.ts
// import { Router } from "express";
// import { OpenproviderService } from "../services/openprovider.service";

// const r = Router();
// const openprovider = new OpenproviderService();

// /**
//  * ✅ Test token + API access
//  * GET /api/openprovider/token-test
//  */
// r.get("/token-test", async (_req, res) => {
//   try {
//     await openprovider.whoAmI();
//     res.json({ ok: true, message: "Openprovider API token is active" });
//   } catch (e: any) {
//     res.status(500).json({
//       ok: false,
//       error: e?.message || "Openprovider token failed",
//     });
//   }
// });

// /**
//  * ✅ Domain check (single)
//  * GET /api/openprovider/domains/check?domain=example.com
//  */
// r.get("/domains/check", async (req, res) => {
//   try {
//     const domain = String(req.query.domain || "").trim();
//     if (!domain) {
//       return res.status(400).json({ ok: false, error: "domain required" });
//     }

//     const data = await openprovider.domainCheck(domain);
//     res.json({ ok: true, data });
//   } catch (e: any) {
//     res.status(500).json({
//       ok: false,
//       error: e?.message || "domain check failed",
//     });
//   }
// });

// /**
//  * ✅ Domain search (multi TLD) + price
//  * GET /api/openprovider/domains/search?name=test&tlds=com,net,ae
//  */
// r.get("/domains/search", async (req, res) => {
//   try {
//     const name = String(req.query.name || "").trim().toLowerCase();
//     const tldsRaw = String(req.query.tlds || "").trim().toLowerCase();

//     if (!name) return res.status(400).json({ ok: false, error: "name required" });
//     if (!tldsRaw) return res.status(400).json({ ok: false, error: "tlds required" });

//     const tlds = tldsRaw
//       .split(",")
//       .map((x) => x.trim().replace(/^\./, ""))
//       .filter(Boolean);

//     const data = await openprovider.searchDomainsWithPrice(name, tlds);
//     res.json({ ok: true, data });
//   } catch (e: any) {
//     res.status(500).json({
//       ok: false,
//       error: e?.message || "domain search failed",
//     });
//   }
// });

// /**
//  * ✅ Transfer price
//  * GET /api/openprovider/domains/transfer-price?domain=example.com
//  */
// r.get("/domains/transfer-price", async (req, res) => {
//   try {
//     const domain = String(req.query.domain || "").trim().toLowerCase();
//     if (!domain) return res.status(400).json({ ok: false, error: "domain required" });

//     const data = await openprovider.transferPrice(domain);
//     res.json({ ok: true, data });
//   } catch (e: any) {
//     res.status(500).json({
//       ok: false,
//       error: e?.message || "transfer price failed",
//     });
//   }
// });

// module.exports = r; // ✅ REQUIRED for safeMount + require
























// backend/routes/openprovider.routes.ts
import { Router } from "express";
import { OpenproviderService } from "../services/openprovider.service";

const r = Router();
const openprovider = new OpenproviderService();

/**
 * ✅ Test token + API access
 * GET /api/openprovider/token-test
 */
r.get("/token-test", async (_req, res) => {
  try {
    await openprovider.whoAmI();
    res.json({ ok: true, message: "Openprovider API token is active" });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "Openprovider token failed",
    });
  }
});

/**
 * ✅ Domain check (single)
 * GET /api/openprovider/domains/check?domain=example.com
 */
r.get("/domains/check", async (req, res) => {
  try {
    const domain = String(req.query.domain || "").trim();
    if (!domain) return res.status(400).json({ ok: false, error: "domain required" });

    const data = await openprovider.domainCheck(domain);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "domain check failed",
    });
  }
});

/**
 * ✅ Domain search (multi TLD) + price
 * GET /api/openprovider/domains/search?name=test&tlds=com,net,ae
 */
r.get("/domains/search", async (req, res) => {
  try {
    const name = String(req.query.name || "").trim().toLowerCase();
    const tldsRaw = String(req.query.tlds || "").trim().toLowerCase();

    if (!name) return res.status(400).json({ ok: false, error: "name required" });
    if (!tldsRaw) return res.status(400).json({ ok: false, error: "tlds required" });

    const tlds = tldsRaw
      .split(",")
      .map((x) => x.trim().replace(/^\./, ""))
      .filter(Boolean);

    const data = await openprovider.searchDomainsWithPrice(name, tlds);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "domain search failed",
    });
  }
});

/**
 * ✅ Transfer price (raw)
 * GET /api/openprovider/domains/transfer-price?domain=example.com
 */
r.get("/domains/transfer-price", async (req, res) => {
  try {
    const domain = String(req.query.domain || "").trim().toLowerCase();
    if (!domain) return res.status(400).json({ ok: false, error: "domain required" });

    const data = await openprovider.transferPrice(domain);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "transfer price failed",
    });
  }
});

/**
 * ✅ NEW: Quote endpoint for checkout (normalized)
 * GET /api/openprovider/domains/quote?domain=example.com&type=new|transfer
 *
 * returns:
 * {
 *   ok: true,
 *   type: "new"|"transfer",
 *   domain: "example.com",
 *   price: number|null,
 *   currency: string|null,
 *   available?: boolean
 * }
 */
r.get("/domains/quote", async (req, res) => {
  try {
    const domain = String(req.query.domain || "").trim().toLowerCase();
    const type = String(req.query.type || "new").trim().toLowerCase();

    if (!domain) return res.status(400).json({ ok: false, error: "domain required" });
    if (!["new", "transfer"].includes(type)) {
      return res.status(400).json({ ok: false, error: "type must be new or transfer" });
    }

    if (type === "transfer") {
      const q = await openprovider.transferQuote(domain);
      return res.json({
        ok: true,
        type: "transfer",
        domain: q.domain,
        price: q.price,
        currency: q.currency,
      });
    }

    const q = await openprovider.registrationQuote(domain);
    return res.json({
      ok: true,
      type: "new",
      domain: q.domain,
      available: q.available,
      price: q.price,
      currency: q.currency,
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message || "quote failed",
    });
  }
});

module.exports = r; // ✅ REQUIRED for safeMount + require
