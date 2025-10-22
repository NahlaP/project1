// import express from "express";
// import { resetTemplateOverrides } from "../controllers/templateReset.controller";

// const router = express.Router();


// router.post("/:userId/:templateId", resetTemplateOverrides);

// export default router;




// backend/routes/templatereset.routes.ts
import express from "express";
import { resetTemplateOverrides } from "../controllers/templateReset.controller";

const router = express.Router();

/**
 * POST /api/template-reset/:userId/:templateId
 *
 * Query params supported and forwarded to the controller:
 *  - ver     (e.g. "v1") -> choose which version's defaults to use
 *  - only    (e.g. "layout") -> order-only reset (keeps user content)
 *  - skipLayout=1            -> clear data overrides only; don't reseed layout
 *
 * Examples:
 *  - Full reset from currentTag (content + order):
 *      POST /api/template-reset/demo-user/sir-template-1
 *
 *  - Full reset from v1:
 *      POST /api/template-reset/demo-user/sir-template-1?ver=v1
 *
 *  - Order-only (keep content), use v1 order:
 *      POST /api/template-reset/demo-user/sir-template-1?ver=v1&only=layout
 */
router.post("/:userId/:templateId", (req, res) => {
  return resetTemplateOverrides(req, res);
});

// Optional: guard other verbs
router.all("/:userId/:templateId", (_req, res) => {
  res.status(405).json({ ok: false, error: "Method Not Allowed" });
});

export default router;
