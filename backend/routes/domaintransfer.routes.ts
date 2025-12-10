import { Router } from "express";
import {
  submitDomainTransfer,
  saveDnsOnlyDomain,
} from "../controllers/domaintransfer.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

r.post("/transfer", requireAuth, submitDomainTransfer);
r.post("/dns", requireAuth, saveDnsOnlyDomain);

export default r;



















// import { Router } from "express";
// import axios from "axios";

// const r = Router();

// // ✅ GET TRANSFER PRICE FROM RESELLER
// r.get("/resellerclub/domain/transfer-quote", async (req, res) => {
//   try {
//     const { domain } = req.query;
//     if (!domain) return res.status(400).json({ error: "Domain required" });

//     const tld = String(domain).split(".").pop();

//     const price = 5945; // ✅ MOCK PRICE = 59.45 AED (replace with real API)

//     return res.json({
//       ok: true,
//       domain,
//       transferPriceCents: price,
//     });
//   } catch (e) {
//     return res.status(500).json({ error: "Transfer price failed" });
//   }
// });


// // ✅ SUBMIT TRANSFER
// r.post("/domain/transfer", async (req, res) => {
//   try {
//     const { domain, authCode, transferPriceCents } = req.body;

//     if (!domain || !authCode) {
//       return res.status(400).json({ error: "Domain & AuthCode required" });
//     }

//     console.log("TRANSFER REQUEST:", {
//       domain,
//       authCode,
//       transferPriceCents,
//     });

//     return res.json({
//       ok: true,
//       domain,
//       transferPrice: transferPriceCents,
//       message: "Transfer request received. We will process it and update you.",
//     });
//   } catch {
//     res.status(500).json({ error: "Transfer failed" });
//   }
// });

// export default r;
