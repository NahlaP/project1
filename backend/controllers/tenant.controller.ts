import { Request, Response } from "express";
import DomainMapping from "../models/DomainMapping";
import Tenant from "../models/Tenant";

function normalizeHost(raw: string): string {
  const host = String(raw || "").trim().toLowerCase();
  return host.replace(/:\d+$/, "");
}

/**
 * Public resolve:
 * GET /api/tenant/resolve?host=www.client.com
 * If host not passed, falls back to request host header.
 */
export async function resolveTenant(req: Request, res: Response) {
  try {
    const qHost = String(req.query.host || "").trim();
    const rawHost =
      qHost ||
      (req.headers["x-forwarded-host"] as string) ||
      (req.headers.host as string) ||
      "";

    const host = normalizeHost(rawHost);
    if (!host) return res.status(400).json({ error: "Missing host" });

    const mapping = await DomainMapping.findOne({ host }).lean();
    if (!mapping) {
      return res.status(404).json({
        error: "No tenant mapped for this domain",
        host,
      });
    }

    const tenant = await Tenant.findById(mapping.tenantId).lean();
    if (!tenant) {
      return res.status(404).json({
        error: "Tenant not found for this domain mapping",
        host,
      });
    }

    return res.json({
      ok: true,
      host,
      tenant: {
        tenantId: String(tenant._id),
        name: tenant.name,
        templateId: tenant.templateId,
        templateVersion: tenant.templateVersion ?? null,
        s3Prefix: tenant.s3Prefix,
      },
    });
  } catch (e) {
    console.error("[tenant.resolve] error:", e);
    return res.status(500).json({ error: "Failed to resolve tenant" });
  }
}
