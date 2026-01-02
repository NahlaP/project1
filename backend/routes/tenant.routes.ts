import { Router } from "express";
import DomainMapping, { normalizeDomain, DomainStatus } from "../models/DomainMapping";

const router = Router();

/**
 * IMPORTANT:
 * We type the lean() result so TS knows templateVersion exists.
 */
type ResolvedTenant = {
  domain: string;
  userId: string;
  templateId: string;
  templateVersion?: string;
  status?: DomainStatus;
  notes?: string;
};

/**
 * PUBLIC resolver used by S3 templates:
 * GET /api/tenant/resolve?host=www.client.com
 */
router.get("/resolve", async (req, res, next) => {
  try {
    const hostRaw = String(req.query.host || "");
    const host = normalizeDomain(hostRaw);

    if (!host) return res.status(400).json({ error: "host is required" });

    // 1) Exact match
    let mapping = await DomainMapping.findOne({
      domain: host,
      status: { $ne: "disabled" },
    }).lean<ResolvedTenant>();

    // 2) fallback: if apex provided but only www exists
    if (!mapping && !host.startsWith("www.")) {
      mapping = await DomainMapping.findOne({
        domain: "www." + host,
        status: { $ne: "disabled" },
      }).lean<ResolvedTenant>();
    }

    // 3) fallback: if www provided but only apex exists
    if (!mapping && host.startsWith("www.")) {
      const apex = host.replace(/^www\./, "");
      mapping = await DomainMapping.findOne({
        domain: apex,
        status: { $ne: "disabled" },
      }).lean<ResolvedTenant>();
    }

    if (!mapping) {
      return res.status(404).json({ error: "domain not mapped", host });
    }

    return res.json({
      userId: mapping.userId,
      templateId: mapping.templateId,
      templateVersion: mapping.templateVersion || "v1",
    });
  } catch (e) {
    next(e);
  }
});

/* ============================================================
   ADMIN CRUD (for onboarding / mapping domains)
   You can later protect these with requireAuth middleware.
   ============================================================ */

/**
 * POST /api/tenant/mappings
 * body: { domain, userId, templateId, templateVersion?, status?, notes? }
 */
router.post("/mappings", async (req, res, next) => {
  try {
    const body = req.body || {};
    const domain = normalizeDomain(body.domain);
    const userId = String(body.userId || "").trim();
    const templateId = String(body.templateId || "").trim();
    const templateVersion = String(body.templateVersion || "v1").trim();
    const status = String(body.status || "active").trim() as DomainStatus;
    const notes = String(body.notes || "").trim();

    if (!domain) return res.status(400).json({ error: "domain is required" });
    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!templateId) return res.status(400).json({ error: "templateId is required" });

    const created = await DomainMapping.create({
      domain,
      userId,
      templateId,
      templateVersion,
      status,
      notes,
    });

    return res.status(201).json(created);
  } catch (e: any) {
    // duplicate domain
    if (e?.code === 11000) return res.status(409).json({ error: "domain already exists" });
    next(e);
  }
});

/**
 * GET /api/tenant/mappings?userId=&templateId=&status=&domain=
 */
router.get("/mappings", async (req, res, next) => {
  try {
    const q: any = {};
    if (req.query.userId) q.userId = String(req.query.userId);
    if (req.query.templateId) q.templateId = String(req.query.templateId);
    if (req.query.status) q.status = String(req.query.status);
    if (req.query.domain) q.domain = normalizeDomain(String(req.query.domain));

    const list = await DomainMapping.find(q).sort({ createdAt: -1 }).lean();
    return res.json(list);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/tenant/mappings/:id
 */
router.patch("/mappings/:id", async (req, res, next) => {
  try {
    const patch: any = { ...(req.body || {}) };
    if (patch.domain) patch.domain = normalizeDomain(patch.domain);

    const updated = await DomainMapping.findByIdAndUpdate(
      req.params.id,
      patch,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "not found" });
    return res.json(updated);
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: "domain already exists" });
    next(e);
  }
});

/**
 * DELETE /api/tenant/mappings/:id
 */
router.delete("/mappings/:id", async (req, res, next) => {
  try {
    const deleted = await DomainMapping.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "not found" });
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export = router;
