
// og
// // controllers/about.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import About from "../models/About";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ------------------------------ helpers ------------------------------ */

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return { imageUrl: "", imageKey: "" };
//   try {
//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }),
//       { expiresIn: 300 }
//     );
//     return { imageUrl: url, imageKey: key };
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return { imageUrl: "", imageKey: key || "" };
//   }
// }

// function normalizeBullets(input: any): { text: string }[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const out: { text: string }[] = [];
//   for (const b of input) {
//     if (!b) continue;
//     if (typeof b === "string") out.push({ text: b });
//     else if (typeof b === "object" && typeof b.text === "string")
//       out.push({ text: b.text });
//   }
//   return out;
// }

// function normalizeLines(input: any): string[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   return input
//     .map((x) => (x == null ? "" : String(x)))
//     .slice(0, 3);
// }

// function normalizeServices(input: any):
//   | { tag?: string; title?: string; heading?: string; href?: string }[]
//   | undefined {
//   if (!Array.isArray(input)) return undefined;
//   return input.slice(0, 3).map((s: any) => ({
//     tag: String(s?.tag ?? s?.category ?? ""),
//     // consolidate to "title" for FE; still accept "heading"
//     title: String(s?.title ?? s?.heading ?? ""),
//     heading: "", // unused by FE; kept for compatibility
//     href: String(s?.href ?? ""),
//   }));
// }

// /** Accept keys only; reject full URLs so we never persist presigned URLs */
// function cleanKeyCandidate(candidate?: string) {
//   let imageKey = String(candidate ?? "");
//   if (!imageKey) return "";
//   // strip accidental absolute paths (like a local multer folder)
//   imageKey = imageKey.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // if someone sends full http(s) URL, do NOT store as key
//   if (/^https?:\/\//i.test(imageKey)) return "";
//   return imageKey;
// }

// /* ------------------------------ handlers ------------------------------ */

// /** GET: user override OR fallback to template default (type='about') */
// export const getAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const about = await About.findOne({ userId, templateId });
//     if (
//       about &&
//       (about.title ||
//         about.subtitle ||
//         about.description ||
//         about.highlight ||
//         about.imageUrl ||
//         (about.lines?.length || 0) > 0 ||
//         (about.services?.length || 0) > 0 ||
//         (about.bullets?.length || 0) > 0)
//     ) {
//       const signed = await presignOrEmpty(about.imageUrl);
//       return res.json({
//         _source: "user",
//         title: about.title || "",
//         subtitle: about.subtitle || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageUrl: signed.imageUrl,
//         imageKey: signed.imageKey,
//         imageAlt: about.imageAlt || "About Image",
//         lines: about.lines || [],
//         services: (about.services || []).map((s) => ({
//           tag: s.tag || "",
//           title: s.title || s.heading || "",
//           href: s.href || "",
//         })),
//         bullets: (about.bullets || []).map((b: any) => ({
//           _id: b?._id,
//           text: b?.text || "",
//         })),
//       });
//     }

//     // 2) template fallback (if your template json has defaults)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections)
//       ? tpl.defaultSections
//       : [];
//     const fallback = defaults
//       .filter((s: any) => s?.type === "about")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (!fallback) {
//       return res.json({
//         _source: "template-none",
//         title: "",
//         subtitle: "",
//         description: "",
//         highlight: "",
//         imageUrl: "",
//         imageKey: "",
//         imageAlt: "About Image",
//         lines: [],
//         services: [],
//         bullets: [],
//       });
//     }

//     const c = fallback.content || {};
//     const fTitle = String(c.title ?? "");
//     const fSubtitle = String(c.subtitle ?? "");
//     const fDescription = String(c.description ?? c.body ?? c.text ?? "");
//     const fHighlight = String(c.highlight ?? "");
//     const fLines = Array.isArray(c.lines) ? c.lines.map(String).slice(0, 3) : [];
//     const fServices = Array.isArray(c.services)
//       ? c.services.slice(0, 3).map((s: any) => ({
//           tag: String(s?.tag ?? s?.category ?? ""),
//           title: String(s?.title ?? s?.heading ?? ""),
//           href: String(s?.href ?? ""),
//         }))
//       : [];

//     let fImageUrl = "";
//     let fImageKey = "";
//     if (c.imageKey) {
//       const signed = await presignOrEmpty(String(c.imageKey));
//       fImageUrl = signed.imageUrl;
//       fImageKey = signed.imageKey;
//     } else if (c.imageUrl && /^https?:\/\//i.test(c.imageUrl)) {
//       fImageUrl = String(c.imageUrl);
//     }

//     const fBullets: { text: string }[] = normalizeBullets(c.bullets) || [];

//     return res.json({
//       _source: "template",
//       title: fTitle,
//       subtitle: fSubtitle,
//       description: fDescription,
//       highlight: fHighlight,
//       imageUrl: fImageUrl,
//       imageKey: fImageKey,
//       imageAlt: String(c.imageAlt ?? "About Image"),
//       lines: fLines,
//       services: fServices,
//       bullets: fBullets,
//     });
//   } catch (e) {
//     console.error("getAbout error:", e);
//     return res.status(500).json({ error: "Failed to fetch About" });
//   }
// };

// /** PUT/POST: upsert About (text + optional image key) */
// export const upsertAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     const title = typeof b.title === "string" ? b.title : undefined;
//     const subtitle = typeof b.subtitle === "string" ? b.subtitle : undefined;
//     const description =
//       typeof b.description === "string"
//         ? b.description
//         : typeof b.body === "string"
//         ? b.body
//         : undefined;
//     const highlight = typeof b.highlight === "string" ? b.highlight : undefined;
//     const imageKey = cleanKeyCandidate(b.imageKey ?? b.imageUrl);
//     const imageAlt =
//       typeof b.imageAlt === "string" ? b.imageAlt : undefined;

//     const bullets = normalizeBullets(b.bullets);
//     const lines = normalizeLines(b.lines);
//     const services = normalizeServices(b.services);

//     const update: Record<string, any> = {};
//     if (title !== undefined) update.title = title;
//     if (subtitle !== undefined) update.subtitle = subtitle;
//     if (description !== undefined) update.description = description;
//     if (highlight !== undefined) update.highlight = highlight;
//     if (imageKey) update.imageUrl = imageKey;
//     if (imageAlt !== undefined) update.imageAlt = imageAlt;
//     if (bullets !== undefined) update.bullets = bullets;
//     if (lines !== undefined) update.lines = lines;
//     if (services !== undefined) update.services = services;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ About saved",
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt,
//         lines: doc.lines || [],
//         services: doc.services || [],
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("upsertAbout error:", e);
//     return res.status(500).json({ error: "Failed to save About" });
//   }
// };

// /** POST: reset About (delete user override → fallback to template on next GET) */
// export const resetAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await About.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetAbout error:", e);
//     return res.status(500).json({ error: "Failed to reset About" });
//   }
// };

// /** POST /image (multipart via multer-s3) */
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // e.g. "sections/about/<timestamp>-name.jpg"
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to upload About image" });
//   }
// };

// /** POST /image-base64 (JSON upload) */
// export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     // smart filename + extension (prevents .jpg.jpg)
//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext =
//       (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime =
//         (typeof dataUrl === "string" &&
//           dataUrl.split(";")[0].split(":")[1]) ||
//         "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/about/${Date.now()}-${base}${ext}`;

//     const b64 =
//       typeof dataUrl === "string" && dataUrl.includes(",")
//         ? dataUrl.split(",")[1]
//         : typeof base64 === "string"
//         ? base64
//         : "";
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: buf,
//         ContentType:
//           ext === ".png"
//             ? "image/png"
//             : ext === ".webp"
//             ? "image/webp"
//             : ext === ".gif"
//             ? "image/gif"
//             : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded (base64)",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload base64 image" });
//   }
// };

// /** DELETE: remove the object from S3 (optional) and clear DB key */
// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOne({ userId, templateId });
//     if (!doc || !doc.imageUrl) {
//       return res.status(404).json({ error: "No image set" });
//     }

//     try {
//       await s3.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: doc.imageUrl as string,
//         })
//       );
//     } catch {
//       // ignore S3 delete failures
//     }

//     doc.imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", imageKey: "" });
//   } catch (e) {
//     console.error("deleteAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to remove image" });
//   }
// };

// /** POST: clear only the image key (no S3 delete) */
// export const clearAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({
//       message: "Image cleared",
//       imageKey: doc?.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("clearAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };





































// // works fine with defualt
// // backend/controllers/about.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import About from "../models/About";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ------------------------------ helpers ------------------------------ */

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return { imageUrl: "", imageKey: "" };
//   try {
//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }),
//       { expiresIn: 300 }
//     );
//     return { imageUrl: url, imageKey: key };
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return { imageUrl: "", imageKey: key || "" };
//   }
// }

// function normalizeBullets(input: any): { text: string }[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const out: { text: string }[] = [];
//   for (const b of input) {
//     if (!b) continue;
//     if (typeof b === "string") out.push({ text: b });
//     else if (typeof b === "object" && typeof b.text === "string")
//       out.push({ text: b.text });
//   }
//   return out;
// }

// function normalizeLines(input: any): string[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   return input.map((x) => (x == null ? "" : String(x))).slice(0, 3);
// }

// const normalizeService = (s: any) => ({
//   tag: String(s?.tag ?? ""),
//   // canonical DB prop is "title"; accept "heading" from clients
//   title: String(s?.title ?? s?.heading ?? ""),
//   href: String(s?.href ?? ""),
// });

// /** Accept keys only; reject full URLs so we never persist presigned URLs */
// function cleanKeyCandidate(candidate?: string) {
//   let imageKey = String(candidate ?? "");
//   if (!imageKey) return "";
//   // strip accidental absolute local path
//   imageKey = imageKey.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // if full http(s) URL comes in, don't store it as a key
//   if (/^https?:\/\//i.test(imageKey)) return "";
//   return imageKey;
// }

// /* ----------------------- template reset defaults ---------------------- */
// /* IMPORTANT: Only fields your About model supports (no video/poster here). */
// const ABOUT_DEFAULTS: Record<string, any> = {
//   "sir-template-1": {
//     subtitle: "- About Us",
//     title: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",                // S3 key if you have one; keep empty if not
//     imageAlt: "About Image",
//     lines: [
//       "We are a creative agency working with",
//       "brands – building insightful strategy,",
//       "creating unique designs.",
//     ],
//     services: [
//       { tag: "Branding", title: "Branding & Design", href: "about.html" },
//       { tag: "Branding", title: "Brand Strategy & Voice", href: "about.html" },
//       { tag: "Design",   title: "Digital & Web Design", href: "about.html" },
//     ],
//     bullets: [],
//   },
//   "gym-template-1": {
//     subtitle: "- About Us",
//     title: "Train smart. Live strong.",
//     description: "",
//     highlight: "Start today.",
//     imageUrl: "",
//     imageAlt: "About Image",
//     lines: [],
//     services: [],
//     bullets: [{ text: "" }, { text: "" }, { text: "" }],
//   },
// };

// /* ------------------------------ handlers ------------------------------ */

// /** GET: return user override OR template defaults when override missing */
// export const getAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await About.findOne({ userId, templateId }).lean<any>();
//     if (doc) {
//       const signed = await presignOrEmpty(doc.imageUrl || "");
//       return res.json({
//         _source: "user",
//         title: doc.title || "",
//         subtitle: doc.subtitle || "",
//         description: doc.description || "",
//         highlight: doc.highlight || "",
//         imageUrl: signed.imageUrl,
//         imageKey: signed.imageKey,
//         imageAlt: doc.imageAlt || "About Image",
//         lines: Array.isArray(doc.lines) ? doc.lines : [],
//         services: (doc.services || []).map((s: any) => ({
//           tag: s?.tag || "",
//           title: s?.title ?? s?.heading ?? "",
//           href: s?.href || "",
//         })),
//         bullets: (doc.bullets || []).map((b: any) => ({ text: b?.text || "" })),
//       });
//     }

//     // 2) template defaults (when override missing)
//     const base = ABOUT_DEFAULTS[templateId] || {
//       subtitle: "",
//       title: "",
//       description: "",
//       highlight: "",
//       imageUrl: "",
//       imageAlt: "About Image",
//       lines: [],
//       services: [],
//       bullets: [],
//     };

//     // If default image value looks like an S3 key (not http/https and not a site-relative path),
//     // presign it; otherwise pass through (frontend will prefix relative paths with backendBaseUrl).
//     let imageUrl = "";
//     let imageKey = "";
//     const looksLikeKey =
//       typeof base.imageUrl === "string" &&
//       base.imageUrl.length > 0 &&
//       !/^https?:\/\//i.test(base.imageUrl) &&
//       !base.imageUrl.startsWith("/");

//     if (looksLikeKey) {
//       const signed = await presignOrEmpty(base.imageUrl);
//       imageUrl = signed.imageUrl;
//       imageKey = signed.imageKey;
//     } else {
//       imageUrl = base.imageUrl || "";
//       imageKey = "";
//     }

//     return res.json({
//       _source: "template",
//       title: base.title || "",
//       subtitle: base.subtitle || "",
//       description: base.description || "",
//       highlight: base.highlight || "",
//       imageUrl,
//       imageKey,
//       imageAlt: base.imageAlt || "About Image",
//       lines: Array.isArray(base.lines) ? base.lines.slice(0, 3).map(String) : [],
//       services: Array.isArray(base.services)
//         ? base.services.slice(0, 3).map((s: any) => ({
//             tag: String(s?.tag ?? ""),
//             title: String(s?.title ?? s?.heading ?? ""),
//             href: String(s?.href ?? ""),
//           }))
//         : [],
//       bullets: Array.isArray(base.bullets)
//         ? base.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
//         : [],
//     });
//   } catch (e) {
//     console.error("getAbout error:", e);
//     return res.status(500).json({ error: "Failed to fetch About" });
//   }
// };

// /** PUT: upsert About (text + optional image key) — NO video/poster */
// export const upsertAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     const title = typeof b.title === "string" ? b.title : undefined;
//     const subtitle = typeof b.subtitle === "string" ? b.subtitle : undefined;
//     const description =
//       typeof b.description === "string"
//         ? b.description
//         : typeof b.body === "string"
//         ? b.body
//         : undefined;
//     const highlight = typeof b.highlight === "string" ? b.highlight : undefined;

//     const imageKey = cleanKeyCandidate(b.imageKey ?? b.imageUrl);
//     const imageAlt = typeof b.imageAlt === "string" ? b.imageAlt : undefined;

//     const bullets = normalizeBullets(b.bullets);
//     const lines = normalizeLines(b.lines);
//     const services = Array.isArray(b.services)
//       ? b.services.slice(0, 3).map(normalizeService)
//       : undefined;

//     const update: Record<string, any> = {};
//     if (title !== undefined) update.title = title;
//     if (subtitle !== undefined) update.subtitle = subtitle;
//     if (description !== undefined) update.description = description;
//     if (highlight !== undefined) update.highlight = highlight;
//     if (imageKey) update.imageUrl = imageKey;
//     if (imageAlt !== undefined) update.imageAlt = imageAlt;
//     if (bullets !== undefined) update.bullets = bullets;
//     if (lines !== undefined) update.lines = lines;
//     if (services !== undefined) update.services = services;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ About saved",
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt,
//         lines: doc.lines || [],
//         services: doc.services || [],
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("upsertAbout error:", e);
//     return res.status(500).json({ error: "Failed to save About" });
//   }
// };

// /** POST: RESET — overwrite with template defaults (Hero-style) */
// export const resetAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     const base = ABOUT_DEFAULTS[templateId] || {
//       subtitle: "",
//       title: "",
//       description: "",
//       highlight: "",
//       imageUrl: "",
//       imageAlt: "About Image",
//       lines: [],
//       services: [],
//       bullets: [],
//     };

//     const payload = {
//       subtitle: base.subtitle || "",
//       title: base.title || "",
//       description: base.description || "",
//       highlight: base.highlight || "",
//       // only store a key if it looks like a key; never store a full URL
//       imageUrl: /^[a-z0-9/_-]+\.(png|jpe?g|webp|gif)$/i.test(base.imageUrl || "")
//         ? base.imageUrl
//         : "",
//       imageAlt: base.imageAlt || "About Image",
//       lines: Array.isArray(base.lines) ? base.lines.slice(0, 3).map(String) : [],
//       services: Array.isArray(base.services)
//         ? base.services.slice(0, 3).map(normalizeService)
//         : [],
//       bullets: Array.isArray(base.bullets)
//         ? base.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
//         : [],
//     };

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: payload },
//       { upsert: true, new: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ About reset to template defaults",
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt || "About Image",
//         lines: doc.lines || [],
//         services: doc.services || [],
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("resetAbout error:", e);
//     return res.status(500).json({ error: "Failed to reset About" });
//   }
// };

// /** POST /image (multipart via multer-s3) */
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // e.g. "sections/about/<timestamp>-name.jpg"
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to upload About image" });
//   }
// };

// /** POST /image-base64 (JSON upload) */
// export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext =
//       (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime =
//         (typeof dataUrl === "string" &&
//           dataUrl.split(";")[0].split(":")[1]) ||
//         "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const baseNm = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/about/${Date.now()}-${baseNm}${ext}`;

//     const b64 =
//       typeof dataUrl === "string" && dataUrl.includes(",")
//         ? dataUrl.split(",")[1]
//         : typeof base64 === "string"
//         ? base64
//         : "";
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: buf,
//         ContentType:
//           ext === ".png"
//             ? "image/png"
//             : ext === ".webp"
//             ? "image/webp"
//             : ext === ".gif"
//             ? "image/gif"
//             : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded (base64)",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload base64 image" });
//   }
// };

// /** DELETE: remove the object from S3 (optional) and clear DB key */
// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOne({ userId, templateId });
//     if (!doc || !doc.imageUrl) {
//       return res.status(404).json({ error: "No image set" });
//     }

//     try {
//       await s3.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: doc.imageUrl as string,
//         })
//       );
//     } catch {
//       // ignore S3 delete failures
//     }

//     doc.imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", imageKey: "" });
//   } catch (e) {
//     console.error("deleteAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to remove image" });
//   }
// };

// /** POST: clear only the image key (no S3 delete) */
// export const clearAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({
//       message: "Image cleared",
//       imageKey: doc?.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("clearAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };












// // work fine with sir-template
// // backend/controllers/about.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import About from "../models/About";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// // IMPORTANT: versioned template model
// import { TemplateModel } from "../models/TemplateV";

// dotenv.config();

// /* ------------------------------------------------------------------ */
// /* Helpers                                                            */
// /* ------------------------------------------------------------------ */

// const ABS = /^https?:\/\//i;

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return { imageUrl: "", imageKey: "" };
//   try {
//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//     return { imageUrl: url, imageKey: key };
//   } catch (e) {
//     console.warn("About presign failed:", key, e);
//     return { imageUrl: "", imageKey: key || "" };
//   }
// }

// /** Accept keys only; reject full URLs so we never persist presigned/absolute URLs */
// function cleanKey(candidate?: string) {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // strip legacy local absolute path if any
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS.test(k)) return ""; // never store http(s)
//   return k.replace(/^\/+/, "");
// }

// function normalizeBullets(input: any): { text: string }[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   return input.map((b) =>
//     typeof b === "string" ? { text: b } : { text: String(b?.text ?? "") }
//   );
// }

// function normalizeLines(input: any): string[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   return input.map((x) => (x == null ? "" : String(x))).slice(0, 3);
// }

// const normalizeService = (s: any) => ({
//   tag: String(s?.tag ?? ""),
//   title: String(s?.title ?? s?.heading ?? ""),
//   href: String(s?.href ?? ""),
// });

// /* ----- Template CDN absolutizer (assets/... -> CDN URL) ----- */
// const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
// const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
// const templateCdnBase = (templateId: string, tag = "v1") =>
//   `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

// const absolutizeTemplateAsset = (templateId: string, p: string, tag = "v1") => {
//   if (!p) return "";
//   if (ABS.test(p)) return p;
//   if (p.startsWith("assets/"))
//     return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
//   return p;
// };

// /* ----- Pick defaults from versions[] or legacy field and return tag used ----- */
// function pickVersionDefaults(tpl: any, verTag?: string): { tagUsed: string; defaults: any[] } {
//   let tagUsed = "legacy";
//   if (Array.isArray(tpl?.versions) && tpl.versions.length) {
//     const chosen =
//       (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
//       (tpl.currentTag && tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
//       tpl.versions[0];
//     tagUsed = chosen?.tag || "v1";
//     return {
//       tagUsed,
//       defaults: Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [],
//     };
//   }
//   return { tagUsed, defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [] };
// }

// /* ------------------------------------------------------------------ */
// /* GET — user override → template version defaults → empty            */
// /* ------------------------------------------------------------------ */
// export const getAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const verTag = (req.query?.ver as string | undefined)?.trim();

//     // 1) User override
//     const doc = await About.findOne({ userId, templateId }).lean<any>();
//     if (doc) {
//       const signed = await presignOrEmpty(doc.imageUrl || "");
//       return res.json({
//         _source: "user",
//         title: doc.title || "",
//         subtitle: doc.subtitle || "",
//         description: doc.description || "",
//         highlight: doc.highlight || "",
//         imageUrl: signed.imageUrl,
//         imageKey: signed.imageKey,
//         imageAlt: doc.imageAlt || "About Image",
//         lines: Array.isArray(doc.lines) ? doc.lines : [],
//         services: Array.isArray(doc.services)
//           ? doc.services.map((s: any) => ({
//               tag: s?.tag || "",
//               title: s?.title ?? s?.heading ?? "",
//               href: s?.href || "",
//             }))
//           : [],
//         bullets: Array.isArray(doc.bullets)
//           ? doc.bullets.map((b: any) => ({ text: b?.text || "" }))
//           : [],
//       });
//     }

//     // 2) Template version defaults
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

//     const about =
//       defaults
//         .filter((s: any) => String(s?.type || "").toLowerCase() === "about")
//         .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

//     if (about && about.content) {
//       const c = about.content || {};

//       // Prefer imageUrl if absolute or assets/…, otherwise treat as S3 key (presign).
//       let imageUrl = "";
//       let imageKey = "";
//       const rawImg = String(c.imageUrl || c.image || "");
//       if (ABS.test(rawImg)) {
//         imageUrl = rawImg;
//       } else if (rawImg.startsWith("assets/")) {
//         imageUrl = absolutizeTemplateAsset(templateId, rawImg, tagUsed);
//       } else if (rawImg) {
//         const signed = await presignOrEmpty(rawImg);
//         imageUrl = signed.imageUrl;
//         imageKey = signed.imageKey;
//       }

//       return res.json({
//         _source: "template",
//         version: tagUsed,
//         title: String(c.title ?? ""),
//         subtitle: String(c.subtitle ?? ""),
//         description: String(c.description ?? ""),
//         highlight: String(c.highlight ?? ""),
//         imageUrl,
//         imageKey,
//         imageAlt: String(c.imageAlt ?? "About Image"),
//         // accept either "lines" (array of 3) or "bullets" as in your HTML
//         lines: Array.isArray(c.lines) ? c.lines.slice(0, 3).map(String) : [],
//         // accept "servicesInline" or "services"
//         services: Array.isArray(c.servicesInline)
//           ? c.servicesInline.slice(0, 3).map(normalizeService)
//           : Array.isArray(c.services)
//           ? c.services.slice(0, 3).map(normalizeService)
//           : [],
//         bullets: Array.isArray(c.bullets)
//           ? c.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
//           : [],
//       });
//     }

//     // 3) Empty
//     return res.json({
//       _source: "template-none",
//       title: "",
//       subtitle: "",
//       description: "",
//       highlight: "",
//       imageUrl: "",
//       imageKey: "",
//       imageAlt: "About Image",
//       lines: [],
//       services: [],
//       bullets: [],
//     });
//   } catch (e) {
//     console.error("getAbout error:", e);
//     return res.status(500).json({ error: "Failed to fetch About" });
//   }
// };

// /* ------------------------------------------------------------------ */
// /* PUT — Upsert (text + optional image key)                           */
// /* ------------------------------------------------------------------ */
// export const upsertAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     const title = typeof b.title === "string" ? b.title : undefined;
//     const subtitle = typeof b.subtitle === "string" ? b.subtitle : undefined;
//     const description =
//       typeof b.description === "string"
//         ? b.description
//         : typeof b.body === "string"
//         ? b.body
//         : undefined;
//     const highlight = typeof b.highlight === "string" ? b.highlight : undefined;

//     const imageKey = cleanKey(b.imageKey ?? b.imageUrl);
//     const imageAlt = typeof b.imageAlt === "string" ? b.imageAlt : undefined;

//     const bullets = normalizeBullets(b.bullets);
//     const lines = normalizeLines(b.lines);
//     const services = Array.isArray(b.services)
//       ? b.services.slice(0, 3).map(normalizeService)
//       : undefined;

//     const update: Record<string, any> = {};
//     if (title !== undefined) update.title = title;
//     if (subtitle !== undefined) update.subtitle = subtitle;
//     if (description !== undefined) update.description = description;
//     if (highlight !== undefined) update.highlight = highlight;
//     if (imageKey) update.imageUrl = imageKey;
//     if (imageAlt !== undefined) update.imageAlt = imageAlt;
//     if (bullets !== undefined) update.bullets = bullets;
//     if (lines !== undefined) update.lines = lines;
//     if (services !== undefined) update.services = services;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ About saved",
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt,
//         lines: doc.lines || [],
//         services: doc.services || [],
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("upsertAbout error:", e);
//     return res.status(500).json({ error: "Failed to save About" });
//   }
// };

// /* ------------------------------------------------------------------ */
// /* POST — Reset (prefer template version defaults)                     */
// /* ------------------------------------------------------------------ */
// export const resetAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const verTag = (req.query?.ver as string | undefined)?.trim();

//     // pull from template defaults if available
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

//     const about =
//       defaults
//         .filter((s: any) => String(s?.type || "").toLowerCase() === "about")
//         .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

//     let payload: any = {
//       title: "",
//       subtitle: "",
//       description: "",
//       highlight: "",
//       imageUrl: "",
//       imageAlt: "About Image",
//       lines: [],
//       services: [],
//       bullets: [],
//     };

//     if (about?.content) {
//       const c = about.content;
//       // only store S3 key; ignore absolute and assets/ in DB
//       const keyCandidate = cleanKey(c.imageUrl || c.image);
//       payload = {
//         title: String(c.title ?? ""),
//         subtitle: String(c.subtitle ?? ""),
//         description: String(c.description ?? ""),
//         highlight: String(c.highlight ?? ""),
//         imageUrl: keyCandidate, // key or ""
//         imageAlt: String(c.imageAlt ?? "About Image"),
//         lines: Array.isArray(c.lines) ? c.lines.slice(0, 3).map(String) : [],
//         services: Array.isArray(c.servicesInline)
//           ? c.servicesInline.slice(0, 3).map(normalizeService)
//           : Array.isArray(c.services)
//           ? c.services.slice(0, 3).map(normalizeService)
//           : [],
//         bullets: Array.isArray(c.bullets)
//           ? c.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
//           : [],
//       };
//     }

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: payload },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: `✅ About reset to ${about ? "template defaults (" + tagUsed + ")" : "empty defaults"}`,
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt || "About Image",
//         lines: doc.lines || [],
//         services: doc.services || [],
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("resetAbout error:", e);
//     return res.status(500).json({ error: "Failed to reset About" });
//   }
// };

// /* ------------------------------------------------------------------ */
// /* Uploads (multipart & base64), delete & clear                        */
// /* ------------------------------------------------------------------ */
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key;
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to upload About image" });
//   }
// };

// export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime =
//         (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const baseNm = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/about/${Date.now()}-${baseNm}${ext}`;

//     const b64 =
//       typeof dataUrl === "string" && dataUrl.includes(",")
//         ? dataUrl.split(",")[1]
//         : typeof base64 === "string"
//         ? base64
//         : "";
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: buf,
//         ContentType:
//           ext === ".png"
//             ? "image/png"
//             : ext === ".webp"
//             ? "image/webp"
//             : ext === ".gif"
//             ? "image/gif"
//             : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded (base64)",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload base64 image" });
//   }
// };

// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOne({ userId, templateId });
//     if (!doc || !doc.imageUrl) {
//       return res.status(404).json({ error: "No image set" });
//     }

//     try {
//       await s3.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: doc.imageUrl as string,
//         })
//       );
//     } catch {
//       /* ignore S3 delete failures */
//     }

//     doc.imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", imageKey: "" });
//   } catch (e) {
//     console.error("deleteAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to remove image" });
//   }
// };

// export const clearAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
//   } catch (e) {
//     console.error("clearAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };













// backend/controllers/about.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import About from "../models/About";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TemplateModel } from "../models/TemplateV";

dotenv.config();

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

async function presignOrEmpty(key?: string) {
  if (!key) return { imageUrl: "", imageKey: "" };
  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
    return { imageUrl: url, imageKey: key };
  } catch (e) {
    console.warn("About presign failed:", key, e);
    return { imageUrl: "", imageKey: key || "" };
  }
}

/** Accept keys only; reject http(s) so we never persist presigned/absolute URLs */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip legacy local absolute path if any
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(k)) return ""; // never store http(s)
  return k.replace(/^\/+/, "");
}

function normalizeBullets(input: any): { text: string }[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input.map((b) =>
    typeof b === "string" ? { text: b } : { text: String(b?.text ?? "") }
  );
}

function normalizeLines(input: any): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input.map((x) => (x == null ? "" : String(x))).slice(0, 3);
}

const normalizeService = (s: any) => ({
  tag: String(s?.tag ?? ""),
  title: String(s?.title ?? s?.heading ?? ""),
  href: String(s?.href ?? ""),
});

/* ----- Template CDN absolutizer (assets/... or img/...) → CDN URL ----- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p: string, tag = "v1") => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  if (
    p.startsWith("assets/") ||
    p.startsWith("img/") ||
    p.startsWith("css/") ||
    p.startsWith("js/") ||
    p.startsWith("lib/")
  ) {
    return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
  }
  return p;
};

/* ----- Pick defaults from versions[] or legacy field and return tag used ----- */
function pickVersionDefaults(
  tpl: any,
  verTag?: string
): { tagUsed: string; defaults: any[] } {
  let tagUsed = "legacy";
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag &&
        tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    return {
      tagUsed,
      defaults: Array.isArray(chosen?.defaultSections)
        ? chosen.defaultSections
        : [],
    };
  }
  return {
    tagUsed,
    defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [],
  };
}

/* ------------------------------------------------------------------ */
/* GET — user override → template version defaults → empty            */
/* ------------------------------------------------------------------ */
export const getAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // 1) User override first
    const doc = await About.findOne({ userId, templateId }).lean<any>();
    if (doc) {
      const signed = await presignOrEmpty(doc.imageUrl || "");
      return res.json({
        _source: "user",
        title: doc.title || "",
        subtitle: doc.subtitle || "",
        description: doc.description || "",
        highlight: doc.highlight || "",
        imageUrl: signed.imageUrl,
        imageKey: signed.imageKey,
        imageAlt: doc.imageAlt || "About Image",
        lines: Array.isArray(doc.lines) ? doc.lines : [],
        services: Array.isArray(doc.services)
          ? doc.services.map((s: any) => ({
              tag: s?.tag || "",
              title: s?.title ?? s?.heading ?? "",
              href: s?.href || "",
            }))
          : [],
        bullets: Array.isArray(doc.bullets)
          ? doc.bullets.map((b: any) => ({ text: b?.text || "" }))
          : [],
      });
    }

    // 2) Template version defaults
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const about =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "about")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (about && about.content) {
      const c = about.content || {};

      // Prefer imageUrl if absolute or assets/img prefix, else treat as S3 key (presign).
      let imageUrl = "";
      let imageKey = "";
      const rawImg = String(c.imageUrl || c.image || "");
      if (ABS.test(rawImg)) {
        imageUrl = rawImg;
      } else if (
        rawImg.startsWith("assets/") ||
        rawImg.startsWith("img/")
      ) {
        imageUrl = absolutizeTemplateAsset(templateId, rawImg, tagUsed);
      } else if (rawImg) {
        const signed = await presignOrEmpty(rawImg);
        imageUrl = signed.imageUrl;
        imageKey = signed.imageKey;
      }

      return res.json({
        _source: "template",
        version: tagUsed,
        title: String(c.title ?? c.heading ?? ""), // tolerate "heading"
        subtitle: String(c.subtitle ?? ""),
        description: String(c.description ?? ""),
        highlight: String(c.highlight ?? c.banner ?? ""),
        imageUrl,
        imageKey,
        imageAlt: String(c.imageAlt ?? "About Image"),
        // accept either "lines" array or map "checks" (gym) to bullets
        lines: Array.isArray(c.lines) ? c.lines.slice(0, 3).map(String) : [],
        services: Array.isArray(c.servicesInline)
          ? c.servicesInline.slice(0, 3).map(normalizeService)
          : Array.isArray(c.services)
          ? c.services.slice(0, 3).map(normalizeService)
          : [],
        bullets: Array.isArray(c.bullets)
          ? c.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
          : Array.isArray(c.checks) // gym seed uses "checks"
          ? c.checks.map((t: any) => ({ text: String(t ?? "") }))
          : [],
      });
    }

    // 3) Empty
    return res.json({
      _source: "template-none",
      title: "",
      subtitle: "",
      description: "",
      highlight: "",
      imageUrl: "",
      imageKey: "",
      imageAlt: "About Image",
      lines: [],
      services: [],
      bullets: [],
    });
  } catch (e) {
    console.error("getAbout error:", e);
    return res.status(500).json({ error: "Failed to fetch About" });
  }
};

/* ------------------------------------------------------------------ */
/* PUT — Upsert (text + optional image key)                           */
/* ------------------------------------------------------------------ */
export const upsertAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const b = (req.body || {}) as any;

    const title =
      typeof b.title === "string"
        ? b.title
        : typeof b.heading === "string"
        ? b.heading
        : undefined;
    const subtitle = typeof b.subtitle === "string" ? b.subtitle : undefined;
    const description =
      typeof b.description === "string"
        ? b.description
        : typeof b.body === "string"
        ? b.body
        : undefined;
    const highlight =
      typeof b.highlight === "string"
        ? b.highlight
        : typeof b.banner === "string"
        ? b.banner
        : undefined;

    const imageKey = cleanKey(b.imageKey ?? b.imageUrl ?? b.image);
    const imageAlt = typeof b.imageAlt === "string" ? b.imageAlt : undefined;

    const bullets =
      normalizeBullets(b.bullets) ??
      (Array.isArray(b.checks) ? b.checks.map((t: any) => ({ text: String(t ?? "") })) : undefined);
    const lines = normalizeLines(b.lines);
    const services = Array.isArray(b.servicesInline)
      ? b.servicesInline.slice(0, 3).map(normalizeService)
      : Array.isArray(b.services)
      ? b.services.slice(0, 3).map(normalizeService)
      : undefined;

    const update: Record<string, any> = {};
    if (title !== undefined) update.title = title;
    if (subtitle !== undefined) update.subtitle = subtitle;
    if (description !== undefined) update.description = description;
    if (highlight !== undefined) update.highlight = highlight;
    if (imageKey) update.imageUrl = imageKey;
    if (imageAlt !== undefined) update.imageAlt = imageAlt;
    if (bullets !== undefined) update.bullets = bullets;
    if (lines !== undefined) update.lines = lines;
    if (services !== undefined) update.services = services;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      message: "✅ About saved",
      data: {
        title: doc.title,
        subtitle: doc.subtitle,
        description: doc.description,
        highlight: doc.highlight,
        imageKey: doc.imageUrl || "",
        imageAlt: doc.imageAlt,
        lines: doc.lines || [],
        services: doc.services || [],
        bullets: doc.bullets || [],
      },
    });
  } catch (e) {
    console.error("upsertAbout error:", e);
    return res.status(500).json({ error: "Failed to save About" });
  }
};

/* ------------------------------------------------------------------ */
/* POST — Reset (prefer template version defaults)                    */
/* ------------------------------------------------------------------ */
export const resetAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // pull from template defaults if available
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const about =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "about")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    let payload: any = {
      title: "",
      subtitle: "",
      description: "",
      highlight: "",
      imageUrl: "",
      imageAlt: "About Image",
      lines: [],
      services: [],
      bullets: [],
    };

    if (about?.content) {
      const c = about.content;
      // only store S3 key; ignore absolute/assets/img in DB
      const keyCandidate = cleanKey(c.imageUrl || c.image);
      payload = {
        title: String(c.title ?? c.heading ?? ""),
        subtitle: String(c.subtitle ?? ""),
        description: String(c.description ?? ""),
        highlight: String(c.highlight ?? c.banner ?? ""),
        imageUrl: keyCandidate, // key or ""
        imageAlt: String(c.imageAlt ?? "About Image"),
        lines: Array.isArray(c.lines) ? c.lines.slice(0, 3).map(String) : [],
        services: Array.isArray(c.servicesInline)
          ? c.servicesInline.slice(0, 3).map(normalizeService)
          : Array.isArray(c.services)
          ? c.services.slice(0, 3).map(normalizeService)
          : [],
        bullets: Array.isArray(c.bullets)
          ? c.bullets.map((b: any) => ({ text: String(b?.text ?? "") }))
          : Array.isArray(c.checks)
          ? c.checks.map((t: any) => ({ text: String(t ?? "") }))
          : [],
      };
    }

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      message: `✅ About reset to ${about ? "template defaults (" + tagUsed + ")" : "empty defaults"}`,
      data: {
        title: doc.title,
        subtitle: doc.subtitle,
        description: doc.description,
        highlight: doc.highlight,
        imageKey: doc.imageUrl || "",
        imageAlt: doc.imageAlt || "About Image",
        lines: doc.lines || [],
        services: doc.services || [],
        bullets: doc.bullets || [],
      },
    });
  } catch (e) {
    console.error("resetAbout error:", e);
    return res.status(500).json({ error: "Failed to reset About" });
  }
};

/* ------------------------------------------------------------------ */
/* Uploads (multipart & base64), delete & clear                       */
/* ------------------------------------------------------------------ */
export const uploadAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key;
  try {
    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    const signed = await presignOrEmpty(key);
    return res.json({
      message: "✅ About image uploaded",
      key,
      imageUrl: signed.imageUrl,
      imageKey: doc.imageUrl || "",
    });
  } catch (e) {
    console.error("uploadAboutImage error:", e);
    return res.status(500).json({ error: "Failed to upload About image" });
  }
};

export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime =
        (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseNm = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/about/${Date.now()}-${baseNm}${ext}`;

    const b64 =
      typeof dataUrl === "string" && dataUrl.includes(",")
        ? dataUrl.split(",")[1]
        : typeof base64 === "string"
        ? base64
        : "";
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType:
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
            ? "image/gif"
            : "image/jpeg",
        ACL: "private",
      })
    );

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    const signed = await presignOrEmpty(key);
    return res.json({
      message: "✅ About image uploaded (base64)",
      key,
      imageUrl: signed.imageUrl,
      imageKey: doc.imageUrl || "",
    });
  } catch (e) {
    console.error("uploadAboutImageBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload base64 image" });
  }
};

export const deleteAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await About.findOne({ userId, templateId });
    if (!doc || !doc.imageUrl) {
      return res.status(404).json({ error: "No image set" });
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: doc.imageUrl as string,
        })
      );
    } catch {
      /* ignore S3 delete failures */
    }

    doc.imageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Image removed", imageKey: "" });
  } catch (e) {
    console.error("deleteAboutImage error:", e);
    return res.status(500).json({ error: "Failed to remove image" });
  }
};

export const clearAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
  } catch (e) {
    console.error("clearAboutImage error:", e);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};
