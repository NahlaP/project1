// // backend/routes/resellerclub.routes.ts
// import { Router, Request, Response } from "express";
// import { checkDomainAvailability } from "../services/resellerclub.service";

// const router = Router();

// /**
//  * ✅ DOMAIN AVAILABILITY CHECK
//  * GET /api/resellerclub/domain/check?name=mybrand&tlds=com,net,ae
//  */
// router.get("/domain/check", async (req: Request, res: Response) => {
//   try {
//     const name = (req.query.name as string | undefined)?.trim();
//     const tldsParam = (req.query.tlds as string | undefined) || "com";

//     if (!name) {
//       return res
//         .status(400)
//         .json({ ok: false, error: "Missing 'name' query param" });
//     }

//     const tlds = tldsParam
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);

//     const raw = await checkDomainAvailability(name, tlds);

//     const mapped = Object.entries(raw).map(([fullDomain, info]) => ({
//       domain: fullDomain,
//       status: info.status, // available | regthroughus | regthroughothers
//     }));

//     res.json({ ok: true, data: mapped });
//   } catch (err: any) {
//     console.error("[ResellerClub Domain Check] Error:", err);
//     res.status(500).json({
//       ok: false,
//       error: err?.message || "Domain check failed",
//     });
//   }
// });

// export default router;
