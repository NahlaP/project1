// import { Router } from "express";
// import {
//   submitDomainTransfer,
//   saveDnsOnlyDomain,
// } from "../controllers/domaintransfer.controller";
// import { requireAuth } from "../middleware/auth.middleware";

// const r = Router();

// r.post("/transfer", requireAuth, submitDomainTransfer);
// r.post("/dns", requireAuth, saveDnsOnlyDomain);

// export default r;

















// backend/routes/domain.transfer.ts
import { Router } from "express";
import axios from "axios";

const r = Router();

// ✅ GET TRANSFER PRICE FROM RESELLER (MOCK)
r.get("/resellerclub/domain/transfer-quote", async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    const tld = String(domain).split(".").pop();

    // TODO: call real ResellerClub API here using axios
    const transferPriceCents = 5945; // 59.45 AED mock

    return res.json({
      ok: true,
      domain,
      tld,
      transferPriceCents,
    });
  } catch (e) {
    console.error("Transfer quote error:", e);
    return res.status(500).json({ error: "Transfer price failed" });
  }
});

// ✅ SUBMIT TRANSFER (we receive just request & epp code for now)
r.post("/domain/transfer", async (req, res) => {
  try {
    const { domain, eppCode } = req.body; // NOTE: eppCode (matches frontend)

    if (!domain || !eppCode) {
      return res.status(400).json({ error: "Domain & AuthCode required" });
    }

    console.log("TRANSFER REQUEST:", {
      domain,
      eppCode,
    });

    // TODO: call ResellerClub transfer API here

    return res.json({
      ok: true,
      domain,
      message:
        "Transfer request received. We will process it and update you by email.",
    });
  } catch (e) {
    console.error("Transfer submit error:", e);
    res.status(500).json({ error: "Transfer failed" });
  }
});

export default r;
