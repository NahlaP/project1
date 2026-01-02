import { Request, Response, NextFunction } from "express";
import DomainMapping from "../models/DomainMapping";
import Tenant from "../models/Tenant";

export type ReqTenant = {
  tenantId: string;
  templateId: string;
  templateVersion?: string | null;
  s3Prefix: string;
};

declare module "express-serve-static-core" {
  interface Request {
    tenant?: ReqTenant;
  }
}

function normalizeHost(raw: string): string {
  // raw can be "mavsketch.com:443"
  const host = String(raw || "").trim().toLowerCase();
  return host.replace(/:\d+$/, "");
}

export async function attachTenantFromHost(req: Request, _res: Response, next: NextFunction) {
  try {
    const rawHost = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
    const host = normalizeHost(rawHost);

    if (!host) return next(); // no host (rare)

    const mapping = await DomainMapping.findOne({ host }).lean();
    if (!mapping) return next(); // allow routes to decide fallback

    const tenant = await Tenant.findById(mapping.tenantId).lean();
    if (!tenant) return next();

    req.tenant = {
      tenantId: String(tenant._id),
      templateId: tenant.templateId,
      templateVersion: tenant.templateVersion ?? null,
      s3Prefix: tenant.s3Prefix,
    };

    return next();
  } catch (err) {
    // do not hard-fail every request; just skip attaching
    return next();
  }
}

/**
 * Enforce tenant existence (use on website/public endpoints that MUST be tenant-aware)
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant?.tenantId) {
    return res.status(400).json({
      error: "Tenant not resolved for this host. Add DomainMapping for this domain.",
    });
  }
  next();
}
