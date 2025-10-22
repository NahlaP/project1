// // og

// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Brands, { BrandsDocument } from "../models/Brands";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 3600 } // 1 hour
//     );
//   } catch (e) {
//     console.warn("Brands presign failed:", key, e);
//     return "";
//   }
// }

// const ABS_RX = /^https?:\/\//i;
// const isThemeAsset = (u?: string) => {
//   const s = String(u ?? "");
//   return s.startsWith("assets/") || s.startsWith("/assets/");
// };

// /** Clean any incoming key: drop absolute URLs, legacy prefixes, leading slashes.
//  *  IMPORTANT: Never treat theme assets (assets/...) as keys.
//  */
// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // theme asset? -> not a key
//   if (isThemeAsset(k)) return "";
//   // legacy local disk prefix
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // absolute URL? -> not a key
//   if (ABS_RX.test(k)) return "";
//   // strip "/uploads/" legacy and leading slashes
//   k = k.replace(/^\/?uploads\//, "");
//   k = k.replace(/^\/+/, "");
//   return k;
// };

// type IncomingBrandRow = {
//   imageUrl?: string;   // may be absolute URL OR a key (we'll clean)
//   imageKey?: string;   // preferred
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// type BrandItem = {
//   imageUrl?: string;   // absolute URL (or theme asset path)
//   imageKey?: string;   // S3 key
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// /** Prefer explicit imageKey; else treat imageUrl as key if not absolute AND not theme asset */
// function normalizeBrandItems(input: any, previous?: BrandItem[]): BrandItem[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingBrandRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevKey = hadPrev ? (prev[i].imageKey || "") : "";
//     const prevUrl = hadPrev ? (prev[i].imageUrl || "") : "";

//     const urlCandidate = (row?.imageUrl ?? "").trim();

//     // explicit key always wins
//     const explicitKey  = cleanKey(row?.imageKey);

//     // if user typed/pasted a theme asset path -> keep as URL (NOT a key)
//     const keepAsThemeUrl = isThemeAsset(urlCandidate);

//     // if it's not absolute and not a theme asset, we *may* treat it as a key (e.g. sections/brands/...)
//     const inferredKey  = !ABS_RX.test(urlCandidate) && !keepAsThemeUrl ? cleanKey(urlCandidate) : "";

//     // decide final fields
//     let imageKey = explicitKey || inferredKey || prevKey;
//     let imageUrl = "";

//     if (ABS_RX.test(urlCandidate) || keepAsThemeUrl) {
//       // absolute or theme asset -> store in imageUrl
//       imageUrl = urlCandidate;
//       // if the user explicitly provided a key, keep it; else clear key
//       if (!explicitKey) imageKey = "";
//     } else if (!imageKey) {
//       // nothing valid provided -> keep previous url if any
//       imageUrl = prevUrl;
//     }

//     return {
//       imageKey,
//       imageUrl,
//       href: typeof row?.href === "string" ? row.href : (hadPrev ? prev[i].href || "#" : "#"),
//       alt:  typeof row?.alt  === "string" ? row.alt  : (hadPrev ? prev[i].alt  || "" : ""),
//       order: Number.isFinite(row?.order) ? Number(row!.order) : (hadPrev ? prev[i].order ?? i : i),
//     };
//   });
// }

// /* ---------------- handlers ---------------- */

// /**
//  * GET /api/brands/:userId/:templateId
//  * Returns items with:
//  *  - imageUrl: browser-usable URL (absolute/theme-asset or presigned from imageKey)
//  *  - imageKey: raw S3 key (for dashboard editing)
//  */
// export const getBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
//     if (doc && (doc.items?.length || 0) > 0) {
//       const items = await Promise.all(
//         doc.items.map(async (b, i) => {
//           // if imageUrl is absolute OR a theme asset -> pass through
//           const rawUrl = String(b.imageUrl || "");
//           if (ABS_RX.test(rawUrl) || isThemeAsset(rawUrl)) {
//             return {
//               imageUrl: rawUrl,
//               imageKey: "",
//               href: b.href || "#",
//               alt:  b.alt  || "",
//               order: Number.isFinite(b.order) ? Number(b.order) : i,
//             };
//           }

//           // otherwise, presign imageKey (when available)
//           const key = cleanKey(b.imageKey || rawUrl /* legacy relative key */);
//           const presigned = key ? await presignOrEmpty(key) : "";

//           return {
//             imageUrl: presigned,               // browser-usable
//             imageKey: key,                     // raw key for dashboard
//             href: b.href || "#",
//             alt:  b.alt  || "",
//             order: Number.isFinite(b.order) ? Number(b.order) : i,
//           };
//         })
//       );
//       return res.json({ _source: "user", items });
//     }

//     // 2) template fallback (type = brands OR clients)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => {
//         const t = String(s?.type || "").toLowerCase();
//         return t === "brands" || t === "clients";
//       })
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     const arr = Array.isArray(fallback?.content?.items) ? fallback.content.items : [];

//     const items = await Promise.all(
//       arr.map(async (it: any, i: number) => {
//         const raw = String(it?.imageKey ?? it?.imageUrl ?? "");
//         if (!raw) {
//           return { imageUrl: "", imageKey: "", href: String(it?.href ?? "#"), alt: String(it?.alt ?? ""), order: i };
//         }
//         if (ABS_RX.test(raw) || isThemeAsset(raw)) {
//           return {
//             imageUrl: raw,
//             imageKey: "",
//             href: String(it?.href ?? "#"),
//             alt: String(it?.alt ?? ""),
//             order: Number.isFinite(it?.order) ? Number(it.order) : i,
//           };
//         } else {
//           const key = cleanKey(raw);
//           const url = key ? await presignOrEmpty(key) : "";
//           return {
//             imageUrl: url,
//             imageKey: key,
//             href: String(it?.href ?? "#"),
//             alt: String(it?.alt ?? ""),
//             order: Number.isFinite(it?.order) ? Number(it?.order) : i,
//           };
//         }
//       })
//     );

//     return res.json({ _source: "template", items });
//   } catch (e) {
//     console.error("getBrands error:", e);
//     return res.status(500).json({ error: "Failed to fetch brands" });
//   }
// };

// /**
//  * PUT /api/brands/:userId/:templateId
//  * Body: { items: [{ imageUrl?, imageKey?, href?, alt?, order? }, ...] }
//  * Saves with validation: require at least one of imageUrl/imageKey per item.
//  */
// export const upsertBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const existing = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();

//     const incoming = normalizeBrandItems((req.body || {}).items, existing?.items);
//     if (!incoming || !incoming.length) {
//       return res.status(400).json({ error: "Items must be a non-empty array" });
//     }

//     const doc = await Brands.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items: incoming } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Brands saved", count: doc.items.length });
//   } catch (e) {
//     console.error("upsertBrands error:", e);
//     return res.status(500).json({ error: "Failed to save brands" });
//   }
// };

// /**
//  * POST /api/brands/:userId/:templateId/image/:index
//  * Uses multer S3 middleware (router sets folder="sections/brands").
//  * Writes the S3 key to items[index].imageKey and returns a presigned URL.
//  */
// export const uploadBrandImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);

//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key; // e.g. "sections/brands/<timestamp>-file.ext"
//     const doc = await Brands.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { [`items.${idx}.imageKey`]: key, [`items.${idx}.imageUrl`]: "" } },
//       { new: true, upsert: true }
//     );

//     const url = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ Brand image uploaded",
//       index: idx,
//       imageUrl: url,   // browser
//       imageKey: key,   // raw key
//       total: doc.items.length,
//     });
//   } catch (e) {
//     console.error("uploadBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to upload brand image" });
//   }
// };

// /**
//  * DELETE /api/brands/:userId/:templateId/image/:index
//  * Deletes the S3 object (best-effort) and clears DB key for that index.
//  */
// export const deleteBrandImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);

//     const doc = await Brands.findOne({ userId, templateId });
//     if (!doc || !doc.items[idx] || !(doc.items[idx].imageKey || doc.items[idx].imageUrl)) {
//       return res.status(404).json({ error: "No image set for this index" });
//     }

//     // Prefer imageKey; fall back to a non-absolute imageUrl that looks like a key (legacy)
//     const key =
//       cleanKey(doc.items[idx].imageKey || (!ABS_RX.test(doc.items[idx].imageUrl || "") ? doc.items[idx].imageUrl : ""));

//     if (key) {
//       try {
//         await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
//       } catch {
//         // ignore S3 delete errors (file may not exist)
//       }
//     }

//     doc.items[idx].imageKey = "";
//     // keep imageUrl only if it was absolute or theme asset; otherwise clear it too
//     if (!(ABS_RX.test(doc.items[idx].imageUrl || "") || isThemeAsset(doc.items[idx].imageUrl))) {
//       doc.items[idx].imageUrl = "";
//     }
//     await doc.save();

//     return res.json({ ok: true, index: idx });
//   } catch (e) {
//     console.error("deleteBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to remove brand image" });
//   }
// };























// // works fine with defualt

// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Brands, { BrandsDocument } from "../models/Brands";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------------- helpers (same style as projects) ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// const ABS_RX = /^https?:\/\//i;

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Brands presign failed:", key, e);
//     return "";
//   }
// }

// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // strip accidental local absolute paths (same as projects)
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS_RX.test(k)) return ""; // never persist full URLs
//   return k;
// };

// /* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
// const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
// const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
// const templateCdnBase = (templateId: string) =>
//   `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/v1/`;

// const absolutizeTemplateAsset = (templateId: string, p: string) => {
//   if (!p) return "";
//   if (ABS_RX.test(p)) return p;
//   if (p.startsWith("assets/")) return templateCdnBase(templateId) + p.replace(/^\/+/, "");
//   return p;
// };

// /* ----- Hardcoded SIR defaults (match your static HTML) ----- */
// function sirBrandDefaults(templateId: string) {
//   const mk = (n: number) => ({
//     imageUrl: absolutizeTemplateAsset(templateId, `assets/imgs/brands/0${n}.png`),
//     imageKey: "", // template assets are absolute, not keys
//     imageAlt: `Brand ${n}`,
//     href: "#0",
//     order: n - 1,
//   });
//   return [1, 2, 3, 4, 5].map(mk);
// }

// /* incoming type mirrors projects style */
// type IncomingBrandRow = {
//   imageUrl?: string;  // may be S3 key (we’ll clean it) or assets/...
//   imageKey?: string;  // preferred: S3 key
//   imageAlt?: string;
//   href?: string;
//   order?: number;
// };

// function normalizeBrands(
//   input: any,
//   previous?: BrandsDocument["items"]
// ): BrandsDocument["items"] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingBrandRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevImg = hadPrev ? (prev[i].imageUrl || "") : "";
//     const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
//     const imageUrl = candidateKey || prevImg;

//     return {
//       imageUrl,
//       imageAlt:
//         typeof row?.imageAlt === "string" && row.imageAlt
//           ? row.imageAlt
//           : hadPrev
//           ? prev[i].imageAlt || "Brand"
//           : "Brand",
//       href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "#0" : "#0",
//       order: Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
//     };
//   });
// }

// /* ---------------- handlers ---------------- */

// /** GET: user override → else template → else hardcoded SIR defaults */
// export const getBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
//     if (doc && (doc.items?.length || 0) > 0) {
//       const items = await Promise.all(
//         doc.items.map(async (b) => {
//           const raw = b.imageUrl || "";
//           const img = ABS_RX.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
//           return {
//             imageUrl: img,
//             imageKey: ABS_RX.test(raw) ? "" : raw,
//             imageAlt: b.imageAlt || "Brand",
//             href: b.href || "#0",
//             order: b.order ?? 0,
//           };
//         })
//       );
//       return res.json({ _source: "user", items });
//     }

//     // 2) DB template defaults (if any)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => String(s?.type).toLowerCase() === "brands")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (fallback && Array.isArray(fallback?.content?.items) && fallback.content.items.length) {
//       const arr = fallback.content.items;
//       const items = await Promise.all(
//         arr.map(async (p: any, i: number) => {
//           const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
//           let img = "";
//           let key = "";

//           if (ABS_RX.test(candidate)) {
//             img = candidate;
//           } else if (candidate.startsWith("assets/")) {
//             img = absolutizeTemplateAsset(templateId, candidate);
//           } else if (candidate) {
//             key = candidate;
//             img = await presignOrEmpty(candidate);
//           }

//           return {
//             imageUrl: img,
//             imageKey: key,
//             imageAlt: String(p?.imageAlt ?? `Brand ${i + 1}`),
//             href: String(p?.href ?? "#0"),
//             order: Number.isFinite(p?.order) ? Number(p?.order) : i,
//           };
//         })
//       );

//       return res.json({ _source: "template", items });
//     }

//     // 3) Hard fallback — your static five items for sir-template-1
//     if (templateId === "sir-template-1") {
//       return res.json({ _source: "hardcoded", items: sirBrandDefaults(templateId) });
//     }

//     return res.json({ _source: "template-none", items: [] });
//   } catch (e) {
//     console.error("getBrands error:", e);
//     return res.status(500).json({ error: "Failed to fetch Brands" });
//   }
// };

// /** PUT: upsert the full items array (keys only; preserves previous if empty) */
// export const upsertBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const existing = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();

//     const incoming = normalizeBrands((req.body || {}).items, existing?.items);
//     if (!incoming) return res.status(400).json({ error: "Missing items array" });

//     const doc = await Brands.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items: incoming } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Brands saved", count: doc.items.length });
//   } catch (e) {
//     console.error("upsertBrands error:", e);
//     return res.status(500).json({ error: "Failed to save Brands" });
//   }
// };

// /** POST: RESET — delete override so GET falls back to template/hardcoded */
// export const resetBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await Brands.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetBrands error:", e);
//     return res.status(500).json({ error: "Failed to reset Brands" });
//   }
// };

// /** POST: upload image for a specific brand index (uses your generic upload.single) */
// export const uploadBrandImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // e.g., "sections/brands/<timestamp>-name.jpg"
//   try {
//     const doc = await Brands.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { [`items.${idx}.imageUrl`]: key } },
//       { new: true, upsert: true }
//     );

//     const url = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ Brand image uploaded",
//       index: idx,
//       imageUrl: url,
//       imageKey: key,
//       total: doc.items.length,
//     });
//   } catch (e) {
//     console.error("uploadBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to upload brand image" });
//   }
// };

// /** DELETE: remove an image for a brand index (and clear DB key) */
// export const deleteBrandImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   try {
//     const doc = await Brands.findOne({ userId, templateId });
//     if (!doc || !doc.items[idx] || !doc.items[idx].imageUrl) {
//       return res.status(404).json({ error: "No image set for this index" });
//     }

//     const key = doc.items[idx].imageUrl;
//     try {
//       await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
//     } catch { /* ignore S3 delete errors */ }

//     doc.items[idx].imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", index: idx });
//   } catch (e) {
//     console.error("deleteBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to remove brand image" });
//   }
// };















// backend/controllers/brands.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Brands, { BrandsDocument } from "../models/Brands";
// IMPORTANT: use the versioned template model
import { TemplateModel } from "../models/TemplateV";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ---------------- helpers ---------------- */
const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Brands presign failed:", key, e);
    return "";
  }
}

/** accept only S3 keys; never persist absolute URLs */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip accidental local absolute path
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(k)) return "";
  return k.replace(/^\/+/, "");
}

/* ----- Template CDN absolutizer (assets/... -> CDN URL) ----- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p: string, tag = "v1") => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  if (p.startsWith("assets/")) return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
  return p;
};

/* ----- Pick defaults from versions[] or legacy ----- */
function pickVersionDefaults(tpl: any, verTag?: string): { tagUsed: string; defaults: any[] } {
  let tagUsed = "legacy";
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag && tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    return {
      tagUsed,
      defaults: Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [],
    };
  }
  return { tagUsed, defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [] };
}

/* ----- Hardcoded SIR defaults (five brand logos) ----- */
function sirBrandDefaults(templateId: string, tag = "v1") {
  const mk = (n: number) => ({
    imageUrl: absolutizeTemplateAsset(templateId, `assets/imgs/brands/0${n}.png`, tag),
    imageKey: "",
    imageAlt: `Brand ${n}`,
    href: "#0",
    order: n - 1,
  });
  return [1, 2, 3, 4, 5].map(mk);
}

/* incoming type (for PUT) */
type IncomingBrandRow = {
  imageUrl?: string; // may be S3 key (preferred) or assets/... (ignored in DB)
  imageKey?: string; // preferred: S3 key
  imageAlt?: string;
  href?: string;
  order?: number;
};

function normalizeBrands(
  input: any,
  previous?: BrandsDocument["items"]
): BrandsDocument["items"] | undefined {
  if (!Array.isArray(input)) return undefined;
  const prev = Array.isArray(previous) ? previous : [];

  return (input as IncomingBrandRow[]).map((row, i) => {
    const hadPrev = !!prev[i];
    const prevKey = hadPrev ? (prev[i].imageUrl || "") : "";
    const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
    const imageUrl = candidateKey || prevKey; // store only key

    return {
      imageUrl,
      imageAlt:
        typeof row?.imageAlt === "string" && row.imageAlt
          ? row.imageAlt
          : hadPrev
          ? prev[i].imageAlt || "Brand"
          : "Brand",
      href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "#0" : "#0",
      order: Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
    };
  });
}

/* ---------------- controllers ---------------- */

/** GET: user override → template version defaults → hardcoded → [] */
export const getBrands = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // 1) User override
    const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
    if (doc && (doc.items?.length || 0) > 0) {
      const items = await Promise.all(
        doc.items.map(async (b, i) => {
          const raw = b.imageUrl || "";
          const img = ABS.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
          return {
            imageUrl: img,
            imageKey: ABS.test(raw) ? "" : raw,
            imageAlt: b.imageAlt || `Brand ${i + 1}`,
            href: b.href || "#0",
            order: b.order ?? i,
          };
        })
      );
      return res.json({ _source: "user", userId, templateId, items });
    }

    // 2) Template version defaults
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const fallback =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "brands")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (fallback && Array.isArray(fallback?.content?.items) && fallback.content.items.length) {
      const arr = fallback.content.items;
      const items = await Promise.all(
        arr.map(async (p: any, i: number) => {
          const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
          let imageUrl = "";
          let imageKey = "";

          if (ABS.test(candidate)) {
            imageUrl = candidate; // already absolute
          } else if (candidate.startsWith("assets/")) {
            imageUrl = absolutizeTemplateAsset(templateId, candidate, tagUsed);
          } else if (candidate) {
            imageKey = candidate; // S3 key
            imageUrl = await presignOrEmpty(candidate);
          }

          return {
            imageUrl,
            imageKey,
            imageAlt: String(p?.imageAlt ?? `Brand ${i + 1}`),
            href: String(p?.href ?? "#0"),
            order: Number.isFinite(p?.order) ? Number(p?.order) : i,
          };
        })
      );

      return res.json({ _source: "template", userId, templateId, version: tagUsed, items });
    }

    // 3) Hardcoded (sir-template-1)
    if (templateId === "sir-template-1") {
      return res.json({
        _source: "hardcoded",
        userId,
        templateId,
        version: verTag || tpl?.currentTag || "v1",
        items: sirBrandDefaults(templateId, verTag || tpl?.currentTag || "v1"),
      });
    }

    // 4) Nothing
    return res.json({ _source: "template-none", userId, templateId, items: [] });
  } catch (e) {
    console.error("getBrands error:", e);
    return res.status(500).json({ error: "Failed to fetch Brands" });
  }
};

/** PUT: replace items (store only S3 keys; preserve previous key if none sent) */
export const upsertBrands = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const existing = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();

    const incoming = normalizeBrands((req.body || {}).items, existing?.items);
    if (!incoming) return res.status(400).json({ error: "Missing items array" });

    const doc = await Brands.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: incoming } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: "✅ Brands saved", count: doc.items.length });
  } catch (e) {
    console.error("upsertBrands error:", e);
    return res.status(500).json({ error: "Failed to save Brands" });
  }
};

/** POST: RESET — delete override so GET falls back to template/hardcoded */
export const resetBrands = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await Brands.deleteMany({ userId, templateId });
    return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
  } catch (e) {
    console.error("resetBrands error:", e);
    return res.status(500).json({ error: "Failed to reset Brands" });
  }
};

/** POST: upload image for a specific index (multer-s3 provides file.key) */
export const uploadBrandImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key; // e.g., "sections/brands/<timestamp>-name.jpg"
  try {
    const doc = await Brands.findOneAndUpdate(
      { userId, templateId },
      { $set: { [`items.${idx}.imageUrl`]: key } },
      { new: true, upsert: true }
    );

    const url = await presignOrEmpty(key);
    return res.json({
      message: "✅ Brand image uploaded",
      index: idx,
      imageUrl: url,
      imageKey: key,
      total: doc.items.length,
    });
  } catch (e) {
    console.error("uploadBrandImage error:", e);
    return res.status(500).json({ error: "Failed to upload brand image" });
  }
};

/** DELETE: remove an image for an index (and clear DB key) */
export const deleteBrandImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
  try {
    const doc = await Brands.findOne({ userId, templateId });
    if (!doc || !doc.items[idx] || !doc.items[idx].imageUrl) {
      return res.status(404).json({ error: "No image set for this index" });
    }

    const key = doc.items[idx].imageUrl;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
    } catch {
      /* ignore S3 delete errors */
    }

    doc.items[idx].imageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Image removed", index: idx });
  } catch (e) {
    console.error("deleteBrandImage error:", e);
    return res.status(500).json({ error: "Failed to remove brand image" });
  }
};
