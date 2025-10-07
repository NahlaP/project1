// og
// backend/controllers/brands.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Brands, { BrandsDocument } from "../models/Brands";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
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
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Brands presign failed:", key, e);
//     return "";
//   }
// }

// const ABS_RX = /^https?:\/\//i;

// // remove absolute URLs and local upload roots; persist only S3-style keys
// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // remove any absolute url (we never store full URLs in DB)
//   if (ABS_RX.test(k)) return "";

//   // strip local upload root if present (when running with local uploader)
//   // adjust this to your local storage root if different
//   k = k.replace(/^\/?uploads\//, "");
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");

//   return k;
// };

// type IncomingBrandRow = {
//   imageUrl?: string;  // may be an S3 key (we’ll clean it) or absolute (ignored for DB)
//   imageKey?: string;  // preferred: S3 key
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// // normalize a list coming from client; keep previous image key if not changed
// function normalizeBrandItems(
//   input: any,
//   previous?: { imageUrl: string; href?: string; alt?: string; order?: number }[]
// ) {
//   if (!Array.isArray(input)) return undefined;

//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingBrandRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevKey = hadPrev ? (prev[i].imageUrl || "") : "";

//     // prefer explicit imageKey; fall back to imageUrl; else keep previous
//     const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
//     const imageKey = candidateKey || prevKey;

//     return {
//       imageUrl: imageKey,                               // persist key only
//       href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "#" : "#",
//       alt:  typeof row?.alt  === "string" ? row.alt  : hadPrev ? prev[i].alt  || "" : "",
//       order: Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? (prev[i].order ?? i) : i,
//     };
//   });
// }

// /* ---------------- handlers ---------------- */

// /** GET /api/brands/:userId/:templateId
//  * Return presigned imageUrl + imageKey (like projects). Falls back to template.
//  */
// export const getBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
//     if (doc && (doc.items?.length || 0) > 0) {
//       const items = await Promise.all(
//         doc.items.map(async (b) => {
//           const key = b.imageUrl || ""; // DB stores key
//           let url = "";
//           if (key) url = await presignOrEmpty(key);
//           return {
//             imageUrl: url,        // presigned for browser
//             imageKey: key,        // raw key if you need to keep/edit
//             href: b.href || "#",
//             alt:  b.alt  || "",
//           };
//         })
//       );
//       return res.json({ _source: "user", items });
//     }

//     // 2) template fallback (defaultSections type 'brands' or 'clients')
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => {
//         const t = String(s?.type || "").toLowerCase();
//         return t === "brands" || t === "clients";
//       })
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (!fallback) {
//       return res.json({ _source: "template-none", items: [] });
//     }

//     const arr = Array.isArray(fallback?.content?.items) ? fallback.content.items : [];
//     const items = await Promise.all(
//       arr.map(async (x: any) => {
//         const raw = x?.imageKey ?? x?.imageUrl ?? "";
//         if (ABS_RX.test(String(raw))) {
//           // absolute URL from template — return as-is (no key)
//           return {
//             imageUrl: String(raw),
//             imageKey: "",
//             href: String(x?.href ?? "#"),
//             alt:  String(x?.alt ?? ""),
//           };
//         }
//         const key = cleanKey(String(raw));
//         const url = key ? await presignOrEmpty(key) : "";
//         return {
//           imageUrl: url,
//           imageKey: key,
//           href: String(x?.href ?? "#"),
//           alt:  String(x?.alt ?? ""),
//         };
//       })
//     );

//     return res.json({ _source: "template", items });
//   } catch (e) {
//     console.error("getBrands error:", e);
//     return res.status(500).json({ error: "Failed to fetch brands" });
//   }
// };

// /** PUT /api/brands/:userId/:templateId
//  * Upsert whole array. Mirrors projects.upsert: keep previous key if client didn’t change it.
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

// /** POST /api/brands/:userId/:templateId/image/:index
//  * Save uploaded file’s S3 key into items[index].imageUrl and return presigned URL + key.
//  * NOTE: routes/brands.routes.ts attaches multer with `folder: sections/brands`;
//  * multer must populate `req.file.key` like "sections/brands/<timestamp>-name.ext"
//  */
// export const uploadBrandImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const index = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//     const file = (req as any).file;

//     if (!file || !file.key) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key; // e.g. "sections/brands/1759-foo.svg"

//     const doc = await Brands.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { [`items.${index}.imageUrl`]: key } },
//       { new: true, upsert: true }
//     );

//     const url = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ Brand image uploaded",
//       index,
//       imageUrl: url,
//       imageKey: key,
//       total: doc.items.length,
//     });
//   } catch (e) {
//     console.error("uploadBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to upload brand image" });
//   }
// };

// /** DELETE /api/brands/:userId/:templateId/image/:index
//  * Delete from S3 and remove the item from the array to avoid violating `imageUrl` required.
//  * If you prefer to keep the slot, make `imageUrl` not required in Brands model and set "" instead.
//  */
// export const deleteBrandImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const index = Math.max(0, parseInt((req.params as any).index, 10) || 0);

//     const doc = await Brands.findOne({ userId, templateId });
//     if (!doc || !Array.isArray(doc.items) || index >= doc.items.length) {
//       return res.json({ ok: true });
//     }

//     const key = doc.items[index]?.imageUrl || "";
//     if (key) {
//       try {
//         await s3.send(
//           new DeleteObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: key,
//           })
//         );
//       } catch {
//         // ignore S3 delete errors
//       }
//     }

//     // Remove the element so schema with required imageUrl won't fail
//     doc.items.splice(index, 1);
//     await doc.save();

//     return res.json({ ok: true, index });
//   } catch (e) {
//     console.error("deleteBrandImage error:", e);
//     return res.status(500).json({ error: "Delete failed" });
//   }
// };























// // C:\Users\97158\Desktop\project1\backend\controllers\brands.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Brands, { BrandsDocument } from "../models/Brands";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
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
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }),
//       { expiresIn: 300 } // 5 minutes
//     );
//   } catch (e) {
//     console.warn("Brands presign failed:", key, e);
//     return "";
//   }
// }

// const ABS_RX = /^https?:\/\//i;

// /**
//  * Normalize any incoming/stored key:
//  * - strip absolute URLs (we never persist those as keys)
//  * - strip legacy `/uploads/...` and local absolute paths
//  * - trim leading slashes
//  */
// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // remove dev absolute path prefix if any
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // never persist absolute URLs as keys
//   if (ABS_RX.test(k)) return "";
//   // strip legacy "/uploads/" prefix
//   k = k.replace(/^\/?uploads\//, "");
//   // trim leading slashes
//   k = k.replace(/^\/+/, "");
//   return k;
// };

// type IncomingBrandRow = {
//   imageUrl?: string;   // may be S3 key (we’ll clean it) or absolute URL (ignored)
//   imageKey?: string;   // preferred S3 key
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// type BrandItem = {
//   imageUrl: string;    // stored S3 key (empty if absolute URL used at template level)
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// /**
//  * Normalize incoming items for PUT:
//  * Prefer explicit imageKey; fall back to cleaned imageUrl; else keep previous.
//  */
// function normalizeBrandItems(input: any, previous?: BrandItem[]): BrandItem[] | undefined {
//   if (!Array.isArray(input)) return undefined;

//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingBrandRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevKey = hadPrev ? (prev[i].imageUrl || "") : "";

//     const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
//     const imageUrl = candidateKey || prevKey;

//     return {
//       imageUrl, // stored as key (or empty if none)
//       href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "#" : "#",
//       alt:  typeof row?.alt  === "string" ? row.alt  : hadPrev ? prev[i].alt  || "" : "",
//       order: Number.isFinite(row?.order) ? Number(row!.order) : (hadPrev ? prev[i].order ?? i : i),
//     };
//   });
// }

// /* ---------------- handlers ---------------- */

// /** GET /api/brands/:userId/:templateId
//  *  1) user override (presigned)
//  *  2) template fallback (defaultSections type "brands" or "clients")
//  *  3) (optional) no hardcoded default; your HTML already has static defaults
//  */
// export const getBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
//     if (doc && (doc.items?.length || 0) > 0) {
//       const items = await Promise.all(
//         doc.items.map(async (b) => {
//           // IMPORTANT: clean legacy values before presigning
//           const key = cleanKey(b.imageUrl || "");
//           const url = key ? await presignOrEmpty(key) : "";
//           return {
//             imageUrl: url,   // presigned URL for the browser
//             imageKey: key,   // raw key so dashboard can keep/edit
//             href: b.href || "#",
//             alt:  b.alt  || "",
//           };
//         })
//       );
//       return res.json({ _source: "user", items });
//     }

//     // 2) template fallback (allow type = brands OR clients)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => {
//         const t = String(s?.type || "").toLowerCase();
//         return t === "brands" || t === "clients";
//       })
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     const arr = Array.isArray(fallback?.content?.items) ? fallback.content.items : [];

//     // Each template item may be { imageKey } or { imageUrl }.
//     // If absolute URL, return as-is; if key, presign.
//     const items = await Promise.all(
//       arr.map(async (it: any, i: number) => {
//         const raw = String(it?.imageKey ?? it?.imageUrl ?? "");
//         if (!raw) {
//           return { imageUrl: "", href: String(it?.href ?? "#"), alt: String(it?.alt ?? ""), order: i };
//         }
//         if (ABS_RX.test(raw)) {
//           // Template provided http(s) — return as-is
//           return {
//             imageUrl: raw,
//             imageKey: "",
//             href: String(it?.href ?? "#"),
//             alt: String(it?.alt ?? ""),
//             order: Number.isFinite(it?.order) ? Number(it.order) : i,
//           };
//         } else {
//           // Treat as S3 key
//           const key = cleanKey(raw);
//           const url = key ? await presignOrEmpty(key) : "";
//           return {
//             imageUrl: url,
//             imageKey: key,
//             href: String(it?.href ?? "#"),
//             alt: String(it?.alt ?? ""),
//             order: Number.isFinite(it?.order) ? Number(it.order) : i,
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

// /** PUT /api/brands/:userId/:templateId
//  * Upsert the array; preserves existing image key if not changed.
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

// /** POST /api/brands/:userId/:templateId/image/:index
//  * Uses multer S3 middleware (router sets folder="sections/brands")
//  * Saves S3 key into items[index].imageUrl and returns presigned URL.
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

// /** DELETE /api/brands/:userId/:templateId/image/:index
//  * Deletes the S3 object (best-effort) and clears DB key for that index.
//  */
// export const deleteBrandImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);

//     const doc = await Brands.findOne({ userId, templateId });
//     if (!doc || !doc.items[idx] || !doc.items[idx].imageUrl) {
//       return res.status(404).json({ error: "No image set for this index" });
//     }

//     const key = cleanKey(doc.items[idx].imageUrl);
//     if (key) {
//       try {
//         await s3.send(new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: key,
//         }));
//       } catch {
//         // ignore S3 delete errors (file may not exist)
//       }
//     }

//     doc.items[idx].imageUrl = "";
//     await doc.save();

//     return res.json({ ok: true, index: idx });
//   } catch (e) {
//     console.error("deleteBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to remove brand image" });
//   }
// };












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
//       { expiresIn: 300 } // 5 minutes
//     );
//   } catch (e) {
//     console.warn("Brands presign failed:", key, e);
//     return "";
//   }
// }

// const ABS_RX = /^https?:\/\//i;

// /** Clean any incoming key: drop absolute URLs, legacy prefixes, leading slashes */
// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS_RX.test(k)) return "";        // never persist absolute URL as a key
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
//   imageUrl?: string;   // absolute URL only (optional)
//   imageKey?: string;   // S3 key only (optional)
//   href?: string;
//   alt?: string;
//   order?: number;
// };

// /** Prefer explicit imageKey; else treat imageUrl as key if not absolute; preserve previous when blank. */
// function normalizeBrandItems(input: any, previous?: BrandItem[]): BrandItem[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingBrandRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevKey = hadPrev ? (prev[i].imageKey || "") : "";
//     const prevUrl = hadPrev ? (prev[i].imageUrl || "") : "";

//     // Decide key/url
//     const urlCandidate = (row?.imageUrl ?? "").trim();
//     const explicitKey  = cleanKey(row?.imageKey);
//     const inferredKey  = !ABS_RX.test(urlCandidate) ? cleanKey(urlCandidate) : "";

//     const imageKey = explicitKey || inferredKey || prevKey;
//     const imageUrl = ABS_RX.test(urlCandidate) ? urlCandidate : (imageKey ? "" : prevUrl);

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
//  *  - imageUrl: browser-usable URL (absolute or presigned from imageKey)
//  *  - imageKey: raw S3 key (for dashboard editing)
//  */
// export const getBrands = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
//     if (doc && (doc.items?.length || 0) > 0) {
//       const items = await Promise.all(
//         doc.items.map(async (b) => {
//           const key = cleanKey(b.imageKey || (!ABS_RX.test(b.imageUrl || "") ? b.imageUrl : ""));
//           const presigned = key ? await presignOrEmpty(key) : "";
//           const absoluteFromDoc = ABS_RX.test(b.imageUrl || "") ? (b.imageUrl || "") : "";
//           return {
//             imageUrl: absoluteFromDoc || presigned, // browser
//             imageKey: key,                           // raw key
//             href: b.href || "#",
//             alt:  b.alt  || "",
//             order: typeof b.order === "number" ? b.order : 0,
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
//         if (ABS_RX.test(raw)) {
//           return {
//             imageUrl: raw, imageKey: "",
//             href: String(it?.href ?? "#"), alt: String(it?.alt ?? ""), order: Number.isFinite(it?.order) ? Number(it.order) : i,
//           };
//         } else {
//           const key = cleanKey(raw);
//           const url = key ? await presignOrEmpty(key) : "";
//           return {
//             imageUrl: url, imageKey: key,
//             href: String(it?.href ?? "#"), alt: String(it?.alt ?? ""), order: Number.isFinite(it?.order) ? Number(it?.order) : i,
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
//     // keep imageUrl only if it was absolute; otherwise clear it too
//     if (!ABS_RX.test(doc.items[idx].imageUrl || "")) doc.items[idx].imageUrl = "";
//     await doc.save();

//     return res.json({ ok: true, index: idx });
//   } catch (e) {
//     console.error("deleteBrandImage error:", e);
//     return res.status(500).json({ error: "Failed to remove brand image" });
//   }
// };














import { Request, Response } from "express";
import dotenv from "dotenv";
import Brands, { BrandsDocument } from "../models/Brands";
import { TemplateModel } from "../models/Template";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ---------------- helpers ---------------- */
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
      { expiresIn: 3600 } // 1 hour
    );
  } catch (e) {
    console.warn("Brands presign failed:", key, e);
    return "";
  }
}

const ABS_RX = /^https?:\/\//i;
const isThemeAsset = (u?: string) => {
  const s = String(u ?? "");
  return s.startsWith("assets/") || s.startsWith("/assets/");
};

/** Clean any incoming key: drop absolute URLs, legacy prefixes, leading slashes.
 *  IMPORTANT: Never treat theme assets (assets/...) as keys.
 */
const cleanKey = (candidate?: string) => {
  let k = String(candidate ?? "");
  if (!k) return "";
  // theme asset? -> not a key
  if (isThemeAsset(k)) return "";
  // legacy local disk prefix
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // absolute URL? -> not a key
  if (ABS_RX.test(k)) return "";
  // strip "/uploads/" legacy and leading slashes
  k = k.replace(/^\/?uploads\//, "");
  k = k.replace(/^\/+/, "");
  return k;
};

type IncomingBrandRow = {
  imageUrl?: string;   // may be absolute URL OR a key (we'll clean)
  imageKey?: string;   // preferred
  href?: string;
  alt?: string;
  order?: number;
};

type BrandItem = {
  imageUrl?: string;   // absolute URL (or theme asset path)
  imageKey?: string;   // S3 key
  href?: string;
  alt?: string;
  order?: number;
};

/** Prefer explicit imageKey; else treat imageUrl as key if not absolute AND not theme asset */
function normalizeBrandItems(input: any, previous?: BrandItem[]): BrandItem[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const prev = Array.isArray(previous) ? previous : [];

  return (input as IncomingBrandRow[]).map((row, i) => {
    const hadPrev = !!prev[i];
    const prevKey = hadPrev ? (prev[i].imageKey || "") : "";
    const prevUrl = hadPrev ? (prev[i].imageUrl || "") : "";

    const urlCandidate = (row?.imageUrl ?? "").trim();

    // explicit key always wins
    const explicitKey  = cleanKey(row?.imageKey);

    // if user typed/pasted a theme asset path -> keep as URL (NOT a key)
    const keepAsThemeUrl = isThemeAsset(urlCandidate);

    // if it's not absolute and not a theme asset, we *may* treat it as a key (e.g. sections/brands/...)
    const inferredKey  = !ABS_RX.test(urlCandidate) && !keepAsThemeUrl ? cleanKey(urlCandidate) : "";

    // decide final fields
    let imageKey = explicitKey || inferredKey || prevKey;
    let imageUrl = "";

    if (ABS_RX.test(urlCandidate) || keepAsThemeUrl) {
      // absolute or theme asset -> store in imageUrl
      imageUrl = urlCandidate;
      // if the user explicitly provided a key, keep it; else clear key
      if (!explicitKey) imageKey = "";
    } else if (!imageKey) {
      // nothing valid provided -> keep previous url if any
      imageUrl = prevUrl;
    }

    return {
      imageKey,
      imageUrl,
      href: typeof row?.href === "string" ? row.href : (hadPrev ? prev[i].href || "#" : "#"),
      alt:  typeof row?.alt  === "string" ? row.alt  : (hadPrev ? prev[i].alt  || "" : ""),
      order: Number.isFinite(row?.order) ? Number(row!.order) : (hadPrev ? prev[i].order ?? i : i),
    };
  });
}

/* ---------------- handlers ---------------- */

/**
 * GET /api/brands/:userId/:templateId
 * Returns items with:
 *  - imageUrl: browser-usable URL (absolute/theme-asset or presigned from imageKey)
 *  - imageKey: raw S3 key (for dashboard editing)
 */
export const getBrands = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const doc = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();
    if (doc && (doc.items?.length || 0) > 0) {
      const items = await Promise.all(
        doc.items.map(async (b, i) => {
          // if imageUrl is absolute OR a theme asset -> pass through
          const rawUrl = String(b.imageUrl || "");
          if (ABS_RX.test(rawUrl) || isThemeAsset(rawUrl)) {
            return {
              imageUrl: rawUrl,
              imageKey: "",
              href: b.href || "#",
              alt:  b.alt  || "",
              order: Number.isFinite(b.order) ? Number(b.order) : i,
            };
          }

          // otherwise, presign imageKey (when available)
          const key = cleanKey(b.imageKey || rawUrl /* legacy relative key */);
          const presigned = key ? await presignOrEmpty(key) : "";

          return {
            imageUrl: presigned,               // browser-usable
            imageKey: key,                     // raw key for dashboard
            href: b.href || "#",
            alt:  b.alt  || "",
            order: Number.isFinite(b.order) ? Number(b.order) : i,
          };
        })
      );
      return res.json({ _source: "user", items });
    }

    // 2) template fallback (type = brands OR clients)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
    const fallback = defaults
      .filter((s: any) => {
        const t = String(s?.type || "").toLowerCase();
        return t === "brands" || t === "clients";
      })
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    const arr = Array.isArray(fallback?.content?.items) ? fallback.content.items : [];

    const items = await Promise.all(
      arr.map(async (it: any, i: number) => {
        const raw = String(it?.imageKey ?? it?.imageUrl ?? "");
        if (!raw) {
          return { imageUrl: "", imageKey: "", href: String(it?.href ?? "#"), alt: String(it?.alt ?? ""), order: i };
        }
        if (ABS_RX.test(raw) || isThemeAsset(raw)) {
          return {
            imageUrl: raw,
            imageKey: "",
            href: String(it?.href ?? "#"),
            alt: String(it?.alt ?? ""),
            order: Number.isFinite(it?.order) ? Number(it.order) : i,
          };
        } else {
          const key = cleanKey(raw);
          const url = key ? await presignOrEmpty(key) : "";
          return {
            imageUrl: url,
            imageKey: key,
            href: String(it?.href ?? "#"),
            alt: String(it?.alt ?? ""),
            order: Number.isFinite(it?.order) ? Number(it?.order) : i,
          };
        }
      })
    );

    return res.json({ _source: "template", items });
  } catch (e) {
    console.error("getBrands error:", e);
    return res.status(500).json({ error: "Failed to fetch brands" });
  }
};

/**
 * PUT /api/brands/:userId/:templateId
 * Body: { items: [{ imageUrl?, imageKey?, href?, alt?, order? }, ...] }
 * Saves with validation: require at least one of imageUrl/imageKey per item.
 */
export const upsertBrands = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const existing = await Brands.findOne({ userId, templateId }).lean<BrandsDocument | null>();

    const incoming = normalizeBrandItems((req.body || {}).items, existing?.items);
    if (!incoming || !incoming.length) {
      return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    const doc = await Brands.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: incoming } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: "✅ Brands saved", count: doc.items.length });
  } catch (e) {
    console.error("upsertBrands error:", e);
    return res.status(500).json({ error: "Failed to save brands" });
  }
};

/**
 * POST /api/brands/:userId/:templateId/image/:index
 * Uses multer S3 middleware (router sets folder="sections/brands").
 * Writes the S3 key to items[index].imageKey and returns a presigned URL.
 */
export const uploadBrandImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);

    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key; // e.g. "sections/brands/<timestamp>-file.ext"
    const doc = await Brands.findOneAndUpdate(
      { userId, templateId },
      { $set: { [`items.${idx}.imageKey`]: key, [`items.${idx}.imageUrl`]: "" } },
      { new: true, upsert: true }
    );

    const url = await presignOrEmpty(key);
    return res.json({
      message: "✅ Brand image uploaded",
      index: idx,
      imageUrl: url,   // browser
      imageKey: key,   // raw key
      total: doc.items.length,
    });
  } catch (e) {
    console.error("uploadBrandImage error:", e);
    return res.status(500).json({ error: "Failed to upload brand image" });
  }
};

/**
 * DELETE /api/brands/:userId/:templateId/image/:index
 * Deletes the S3 object (best-effort) and clears DB key for that index.
 */
export const deleteBrandImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);

    const doc = await Brands.findOne({ userId, templateId });
    if (!doc || !doc.items[idx] || !(doc.items[idx].imageKey || doc.items[idx].imageUrl)) {
      return res.status(404).json({ error: "No image set for this index" });
    }

    // Prefer imageKey; fall back to a non-absolute imageUrl that looks like a key (legacy)
    const key =
      cleanKey(doc.items[idx].imageKey || (!ABS_RX.test(doc.items[idx].imageUrl || "") ? doc.items[idx].imageUrl : ""));

    if (key) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
      } catch {
        // ignore S3 delete errors (file may not exist)
      }
    }

    doc.items[idx].imageKey = "";
    // keep imageUrl only if it was absolute or theme asset; otherwise clear it too
    if (!(ABS_RX.test(doc.items[idx].imageUrl || "") || isThemeAsset(doc.items[idx].imageUrl))) {
      doc.items[idx].imageUrl = "";
    }
    await doc.save();

    return res.json({ ok: true, index: idx });
  } catch (e) {
    console.error("deleteBrandImage error:", e);
    return res.status(500).json({ error: "Failed to remove brand image" });
  }
};
