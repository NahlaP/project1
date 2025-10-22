// import { Request, Response } from 'express';
// import Footer from '../models/Footer';

// export const getFooter = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const doc = await Footer.findOne({ userId, templateId }).lean();
//     res.json(doc || {});
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch footer' });
//   }
// };

// const ALLOWED = [
//   'topSubtitle','emailLabel','emailHref',
//   'logoUrl',
//   'officeAddress','officePhone','officePhoneHref',
//   'copyrightHtml',
//   'social','links'
// ] as const;

// function pickAllowed(body: any) {
//   const out: any = {};
//   if (!body || typeof body !== 'object') return out;
//   for (const k of ALLOWED) if (body[k] !== undefined) out[k] = body[k];
//   return out;
// }

// export const saveFooter = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const update = pickAllowed(req.body);

//     const result = await Footer.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update, $setOnInsert: { userId, templateId } },
//       { new: true, upsert: true }
//     ).lean();

//     res.json({ message: '✅ Footer saved', result });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save footer' });
//   }
// };






// backend/controllers/footer.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Footer from "../models/Footer";
import { TemplateModel } from "../models/TemplateV";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ------------------------------- helpers ------------------------------- */

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

const ABS = /^https?:\/\//i;

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Footer presign failed:", key, e);
    return "";
  }
}

/** Only keep S3 keys; never persist full URLs. */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip accidental absolute local path
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(k)) return ""; // don't store absolute URLs as keys
  return k.replace(/^\/+/, "");
}

/* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p: string, tag?: string) => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  if (p.startsWith("assets/"))
    return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
  return p;
};

/* ----------------------- defaults mapping (SIR) ----------------------- */
/** Map TemplateV "footer" content → Footer model fields */
function mapTemplateFooterToSchema(
  templateId: string,
  content: any,
  tag?: string
) {
  const email = String(content?.email ?? "").trim();
  const phone = String(content?.office?.phone ?? "").trim();

  return {
    topSubtitle: String(content?.emailHeading ?? ""),
    emailLabel: email,
    emailHref: email ? `mailto:${email}` : "",
    logoUrl: absolutizeTemplateAsset(templateId, String(content?.logoUrl ?? ""), tag),
    officeAddress: String(content?.office?.address ?? ""),
    officePhone: phone,
    officePhoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "",
    copyrightHtml: String(content?.copyrightHtml ?? ""),
    social:
      Array.isArray(content?.socials)
        ? content.socials.map((s: any) => ({
            label: String(s?.label ?? ""),
            href: String(s?.href ?? "#0"),
          }))
        : [],
    links:
      Array.isArray(content?.footerLinks)
        ? content.footerLinks.map((l: any) => ({
            label: String(l?.label ?? ""),
            href: String(l?.href ?? "#0"),
          }))
        : [],
  };
}

/** Hard fallback when there’s no DB template */
function hardcodedSirFooter(templateId: string) {
  return mapTemplateFooterToSchema(
    templateId,
    {
      emailHeading: "we would love to hear from you.",
      email: "hello@Bayone.com",
      logoUrl: "assets/imgs/logo-light.png",
      socials: [
        { label: "Facebook", href: "#0" },
        { label: "twitter", href: "#0" },
        { label: "LinkedIn", href: "#0" },
        { label: "Behance", href: "#0" },
      ],
      office: {
        address: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
        phone: "+2 456 34324 45",
      },
      footerLinks: [
        { label: "FAQ", href: "about.html" },
        { label: "Careers", href: "about.html" },
        { label: "Contact Us", href: "contact.html" },
      ],
      copyrightHtml:
        '© 2023 Bayone is Proudly Powered by <span class="underline"><a href="https://themeforest.net/user/ui-themez" target="_blank">Ui-ThemeZ</a></span>',
    },
    "v1"
  );
}

/* ---------------------------- whitelist/save ---------------------------- */

const ALLOWED = [
  "topSubtitle",
  "emailLabel",
  "emailHref",
  "logoUrl",
  "officeAddress",
  "officePhone",
  "officePhoneHref",
  "copyrightHtml",
  "social",
  "links",
] as const;

function pickAllowed(body: any) {
  const out: any = {};
  if (!body || typeof body !== "object") return out;

  for (const k of ALLOWED) {
    if (k === "social" && Array.isArray(body.social)) {
      out.social = body.social.map((s: any) => ({
        label: String(s?.label ?? ""),
        href: String(s?.href ?? "#0"),
      }));
    } else if (k === "links" && Array.isArray(body.links)) {
      out.links = body.links.map((l: any) => ({
        label: String(l?.label ?? ""),
        href: String(l?.href ?? "#0"),
      }));
    } else if (body[k] !== undefined) {
      out[k] = body[k];
    }
  }
  // Special handling: only store S3 key for logoUrl
  if ("logoUrl" in out) {
    const key = cleanKey(out.logoUrl || body.logoKey);
    if (key) out.logoUrl = key;
    else delete out.logoUrl; // ignore absolute URLs during save
  }

  // Normalize phone/mailto helpers if user supplied phone/email
  if (typeof out.officePhone === "string" && !out.officePhoneHref) {
    out.officePhoneHref = `tel:${out.officePhone.replace(/[^\d+]/g, "")}`;
  }
  if (typeof out.emailLabel === "string" && !out.emailHref) {
    out.emailHref = `mailto:${out.emailLabel}`;
  }

  return out;
}

/* -------------------------------- handlers ------------------------------- */

/** GET: user override → versioned TemplateV footer → hardcoded SIR */
export const getFooter = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag =
      String((req.query?.ver ?? "") as string).trim() || undefined;

    // 1) User override
    const doc = await Footer.findOne({ userId, templateId }).lean<any>();
    if (doc) {
      // Logo resolution:
      // - S3 key => presign
      // - assets/... => absolutize
      // - http(s) => pass through (shouldn’t be stored, but just in case)
      let logoUrl = String(doc.logoUrl || "");
      if (logoUrl) {
        if (!ABS.test(logoUrl)) {
          if (logoUrl.startsWith("assets/")) {
            logoUrl = absolutizeTemplateAsset(templateId, logoUrl, verTag);
          } else {
            // presume S3 key
            logoUrl = (await presignOrEmpty(logoUrl)) || "";
          }
        }
      }

      return res.json({
        _source: "user",
        ...doc,
        logoUrl,
      });
    }

    // 2) TemplateV defaults (footer section)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    if (tpl && Array.isArray(tpl.versions) && tpl.versions.length) {
      const chosen =
        (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
        (tpl.currentTag &&
          tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
        tpl.versions[0];

      const footerRow =
        (Array.isArray(chosen?.defaultSections)
          ? chosen.defaultSections
          : []
        ).find((s: any) => String(s?.type || "").toLowerCase() === "footer");

      if (footerRow && footerRow.content) {
        const mapped = mapTemplateFooterToSchema(
          templateId,
          footerRow.content,
          chosen?.tag
        );
        return res.json({ _source: "template", ...mapped });
      }
    }

    // 3) Hardcoded SIR fallback
    if (templateId === "sir-template-1") {
      return res.json({ _source: "hardcoded", ...hardcodedSirFooter(templateId) });
    }

    return res.json({ _source: "template-none", social: [], links: [] });
  } catch (err) {
    console.error("getFooter error:", err);
    res.status(500).json({ error: "Failed to fetch footer" });
  }
};

/** PUT: upsert only ALLOWED fields, storing S3 key (not full URL) for logo */
export const saveFooter = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const update = pickAllowed(req.body);
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const result = await Footer.findOneAndUpdate(
      { userId, templateId },
      { $set: { ...update, userId, templateId } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ message: "✅ Footer saved", result });
  } catch (err) {
    console.error("saveFooter error:", err);
    res.status(500).json({ error: "Failed to save footer" });
  }
};

/** POST: RESET — delete override so GET falls back to template/hardcoded */
export const resetFooter = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await Footer.deleteMany({ userId, templateId });
    return res.json({
      ok: true,
      deleted: r.deletedCount ?? 0,
      message: "✅ Footer reset to defaults",
    });
  } catch (err) {
    console.error("resetFooter error:", err);
    res.status(500).json({ error: "Failed to reset footer" });
  }
};
