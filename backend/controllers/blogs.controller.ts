// og

// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Blog from "../models/Blog";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------- helpers ---------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 } // 5m
//     );
//   } catch (e) {
//     console.warn("Blogs presign failed:", key, e);
//     return "";
//   }
// }

// const ABS = /^https?:\/\//i;

// /** Keep only S3 keys. If absolute URL → return "" so we never persist it. */
// function cleanKey(candidate?: string) {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // strip legacy dev absolute path if any
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // never store absolute URLs in DB
//   if (ABS.test(k)) return "";
//   // trim leading slashes
//   k = k.replace(/^\/+/, "");
//   return k;
// }

// /* ---------- controllers ---------- */

// /** GET all posts (presigns image keys) */
// export const getBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await Blog.findOne({ userId, templateId }).lean();
//     if (!doc) return res.json({ userId, templateId, items: [] });

//     const items = await Promise.all(
//       (doc.items || []).map(async (it: any) => ({
//         ...it,
//         imageKey: it.imageUrl || "",
//         imageUrl: await presignOrEmpty(it.imageUrl),
//       }))
//     );

//     return res.json({ ...doc, items });
//   } catch (e) {
//     console.error("getBlogs error:", e);
//     return res.status(500).json({ error: "Failed to fetch blogs" });
//   }
// };

// /** PUT replace list (PRESERVE previous image key unless a new key is sent) */
// export const upsertBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const incoming = Array.isArray((req.body as any)?.items)
//       ? (req.body as any).items
//       : [];

//     const existing = await Blog.findOne({ userId, templateId }).lean();
//     const prev = Array.isArray(existing?.items) ? existing!.items : [];

//     const norm = incoming.map((it: any, i: number) => {
//       const candKey = cleanKey(it?.imageKey ?? it?.imageUrl); // key if provided
//       const prevKey = prev[i]?.imageUrl || "";
//       const finalKey = candKey || prevKey;                     // preserve old key

//       const order = Number.isFinite(it?.order)
//         ? Number(it.order)
//         : (prev[i]?.order ?? i);

//       const { imageKey, imageUrl, ...rest } = it || {};
//       return {
//         ...rest,
//         imageUrl: finalKey, // always a key or ""
//         order,
//       };
//     });

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items: norm } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blogs saved", result: updated });
//   } catch (e) {
//     console.error("upsertBlogs error:", e);
//     return res.status(500).json({ error: "Failed to save blogs" });
//   }
// };

// /** POST add one (accept key if sent; otherwise leave empty) */
// export const addBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     const candKey = cleanKey(b?.imageKey ?? b?.imageUrl); // key only
//     const { imageKey, imageUrl, ...rest } = b || {};

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $push: { items: { ...rest, imageUrl: candKey || "" } } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blog added", result: doc });
//   } catch (e) {
//     console.error("addBlog error:", e);
//     return res.status(500).json({ error: "Failed to add blog" });
//   }
// };

// /** PUT update one by :postId (only change image when a NEW key is sent) */
// export const updateBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const u = (req.body || {}) as any;

//     const set: any = {};
//     for (const k of ["title", "excerpt", "tag", "date", "href", "delay", "order"]) {
//       if (u[k] !== undefined) set[`items.$.${k}`] = k === "order" ? Number(u[k]) : u[k];
//     }

//     const candKey = cleanKey(u?.imageKey ?? u?.imageUrl); // key only; ignore absolute
//     if (candKey) set["items.$.imageUrl"] = candKey;

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: set },
//       { new: true }
//     );

//     return res.json({ message: "✅ Blog updated", result: doc });
//   } catch (e) {
//     console.error("updateBlog error:", e);
//     return res.status(500).json({ error: "Failed to update blog" });
//   }
// };

// /** DELETE one by :postId */
// export const deleteBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { items: { _id: postId } } },
//       { new: true }
//     );
//     return res.json({ message: "✅ Blog removed", result: doc });
//   } catch (e) {
//     console.error("deleteBlog error:", e);
//     return res.status(500).json({ error: "Failed to delete blog" });
//   }
// };

// /** POST image multipart → save S3 key into this post */
// export const uploadBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key;

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": key } },
//       { new: true }
//     );

//     return res.json({
//       message: "✅ Blog image uploaded",
//       key,
//       result: updated,
//     });
//   } catch (e) {
//     console.error("uploadBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to upload image" });
//   }
// };

// /** DELETE image from S3 and clear field */
// export const deleteBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;

//     const doc = await Blog.findOne({ userId, templateId });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const item = (doc.items || []).find((x: any) => String(x._id) === postId);
//     if (!item || !item.imageUrl) return res.status(404).json({ error: "No image set" });

//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: item.imageUrl as string,
//       }));
//     } catch {
//       /* ignore delete failures */
//     }

//     await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": "" } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Image removed" });
//   } catch (e) {
//     console.error("deleteBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to delete image" });
//   }
// };





// works with new method
// // C:\Users\97158\Desktop\project1 dev\project1\backend\controllers\blogs.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Blog from "../models/Blog";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { TemplateModel } from "../models/Template";

// dotenv.config();

// /* ---------- helpers ---------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 } // 5m
//     );
//   } catch (e) {
//     console.warn("Blogs presign failed:", key, e);
//     return "";
//   }
// }

// const ABS = /^https?:\/\//i;

// /** Keep only S3 keys. If absolute URL → return "" so we never persist it. */
// function cleanKey(candidate?: string) {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // strip legacy dev absolute path if any
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // never store absolute URLs in DB
//   if (ABS.test(k)) return "";
//   // trim leading slashes
//   k = k.replace(/^\/+/, "");
//   return k;
// }

// /* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
// const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
// const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
// const templateCdnBase = (templateId: string) =>
//   `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/v1/`;

// const absolutizeTemplateAsset = (templateId: string, p: string) => {
//   if (!p) return "";
//   if (ABS.test(p)) return p;
//   if (p.startsWith("assets/")) return templateCdnBase(templateId) + p.replace(/^\/+/, "");
//   return p;
// };

// /* ----- Hardcoded SIR defaults (3 posts with template images) ----- */
// function sirBlogDefaults(templateId: string) {
//   const img = (n: number) => absolutizeTemplateAsset(templateId, `assets/imgs/blog/${n}.jpg`);
//   return [
//     {
//       title: "Design that sparks emotion",
//       excerpt:
//         "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
//       tag: "News",
//       date: "2023-09-01",
//       href: "blog-details.html",
//       delay: ".2",
//       order: 0,
//       imageUrl: img(1),
//       imageKey: "",
//     },
//     {
//       title: "Shaping brands with clarity",
//       excerpt:
//         "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
//       tag: "News",
//       date: "2023-09-01",
//       href: "blog-details.html",
//       delay: ".3",
//       order: 1,
//       imageUrl: img(2),
//       imageKey: "",
//     },
//     {
//       title: "From idea to identity",
//       excerpt:
//         "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
//       tag: "News",
//       date: "2023-09-01",
//       href: "blog-details.html",
//       delay: ".4",
//       order: 2,
//       imageUrl: img(3),
//       imageKey: "",
//     },
//   ];
// }

// /* ---------- controllers ---------- */

// /** GET posts with priority: user override → template defaults → hardcoded SIR → [] */
// export const getBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) User override in DB
//     const doc = await Blog.findOne({ userId, templateId }).lean();
//     if (doc && Array.isArray(doc.items) && doc.items.length) {
//       const items = await Promise.all(
//         (doc.items || []).map(async (it: any) => {
//           const raw = String(it?.imageUrl || "");
//           const img =
//             ABS.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
//           return {
//             ...it,
//             imageKey: ABS.test(raw) ? "" : raw,
//             imageUrl: img,
//           };
//         })
//       );
//       return res.json({ _source: "user", userId, templateId, items });
//     }

//     // 2) Template defaults (types that might carry posts)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl!.defaultSections : [];
//     const fallback =
//       defaults
//         .filter((s: any) => {
//           const t = String(s?.type || "").toLowerCase();
//           return t === "blogs" || t === "blog" || t === "news" || t === "posts";
//         })
//         .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

//     if (fallback) {
//       const arr = Array.isArray(fallback?.content?.items)
//         ? fallback.content.items
//         : Array.isArray(fallback?.content?.posts)
//         ? fallback.content.posts
//         : [];

//       if (arr.length) {
//         const items = await Promise.all(
//           arr.map(async (p: any, i: number) => {
//             const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
//             let imageUrl = "";
//             let imageKey = "";

//             if (ABS.test(candidate)) {
//               imageUrl = candidate; // absolute URL from template
//             } else if (candidate.startsWith("assets/")) {
//               imageUrl = absolutizeTemplateAsset(templateId, candidate);
//             } else if (candidate) {
//               imageKey = candidate; // S3 key in template
//               imageUrl = await presignOrEmpty(candidate);
//             }

//             return {
//               title: String(p?.title ?? ""),
//               excerpt: String(p?.excerpt ?? ""),
//               tag: String(p?.tag ?? ""),
//               date: String(p?.date ?? ""),
//               href: String(p?.href ?? "blog-details.html"),
//               delay: String(p?.delay ?? `.${(i % 3) + 2}`),
//               order: Number.isFinite(p?.order) ? Number(p?.order) : i,
//               imageUrl,
//               imageKey,
//             };
//           })
//         );

//         return res.json({ _source: "template", userId, templateId, items });
//       }
//     }

//     // 3) Hardcoded SIR defaults (with absolute template URLs)
//     if (templateId === "sir-template-1") {
//       return res.json({
//         _source: "hardcoded",
//         userId,
//         templateId,
//         items: sirBlogDefaults(templateId),
//       });
//     }

//     // 4) nothing
//     return res.json({ _source: "template-none", userId, templateId, items: [] });
//   } catch (e) {
//     console.error("getBlogs error:", e);
//     return res.status(500).json({ error: "Failed to fetch blogs" });
//   }
// };

// /** PUT replace list (PRESERVE previous image key unless a new key is sent) */
// export const upsertBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const incoming = Array.isArray((req.body as any)?.items)
//       ? (req.body as any).items
//       : [];

//     const existing = await Blog.findOne({ userId, templateId }).lean();
//     const prev = Array.isArray(existing?.items) ? existing!.items : [];

//     const norm = incoming.map((it: any, i: number) => {
//       const candKey = cleanKey(it?.imageKey ?? it?.imageUrl); // key if provided
//       const prevKey = prev[i]?.imageUrl || "";
//       const finalKey = candKey || prevKey; // preserve old key

//       const order = Number.isFinite(it?.order)
//         ? Number(it.order)
//         : (prev[i]?.order ?? i);

//       const { imageKey, imageUrl, ...rest } = it || {};
//       return {
//         ...rest,
//         imageUrl: finalKey, // always a key or ""
//         order,
//       };
//     });

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items: norm } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blogs saved", result: updated });
//   } catch (e) {
//     console.error("upsertBlogs error:", e);
//     return res.status(500).json({ error: "Failed to save blogs" });
//   }
// };

// /** POST add one (accept key if sent; otherwise leave empty) */
// export const addBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     const candKey = cleanKey(b?.imageKey ?? b?.imageUrl); // key only
//     const { imageKey, imageUrl, ...rest } = b || {};

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $push: { items: { ...rest, imageUrl: candKey || "" } } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blog added", result: doc });
//   } catch (e) {
//     console.error("addBlog error:", e);
//     return res.status(500).json({ error: "Failed to add blog" });
//   }
// };

// /** PUT update one by :postId (only change image when a NEW key is sent) */
// export const updateBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const u = (req.body || {}) as any;

//     const set: any = {};
//     for (const k of ["title", "excerpt", "tag", "date", "href", "delay", "order"]) {
//       if (u[k] !== undefined) set[`items.$.${k}`] = k === "order" ? Number(u[k]) : u[k];
//     }

//     const candKey = cleanKey(u?.imageKey ?? u?.imageUrl); // key only; ignore absolute
//     if (candKey) set["items.$.imageUrl"] = candKey;

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: set },
//       { new: true }
//     );

//     return res.json({ message: "✅ Blog updated", result: doc });
//   } catch (e) {
//     console.error("updateBlog error:", e);
//     return res.status(500).json({ error: "Failed to update blog" });
//   }
// };

// /** DELETE one by :postId */
// export const deleteBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { items: { _id: postId } } },
//       { new: true }
//     );
//     return res.json({ message: "✅ Blog removed", result: doc });
//   } catch (e) {
//     console.error("deleteBlog error:", e);
//     return res.status(500).json({ error: "Failed to delete blog" });
//   }
// };

// /** POST image multipart → save S3 key into this post */
// export const uploadBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key;

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": key } },
//       { new: true }
//     );

//     return res.json({
//       message: "✅ Blog image uploaded",
//       key,
//       result: updated,
//     });
//   } catch (e) {
//     console.error("uploadBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to upload image" });
//   }
// };

// /** DELETE image from S3 and clear field */
// export const deleteBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;

//     const doc = await Blog.findOne({ userId, templateId });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const item = (doc.items || []).find((x: any) => String(x._id) === postId);
//     if (!item || !item.imageUrl) return res.status(404).json({ error: "No image set" });

//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: item.imageUrl as string,
//       }));
//     } catch {
//       /* ignore delete failures */
//     }

//     await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": "" } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Image removed" });
//   } catch (e) {
//     console.error("deleteBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to delete image" });
//   }
// };

// /** POST: RESET — delete override so GET falls back to template/hardcoded */
// export const resetBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await Blog.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetBlogs error:", e);
//     return res.status(500).json({ error: "Failed to reset blogs" });
//   }
// };
























// backend/controllers/blogs.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Blog from "../models/Blog";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// IMPORTANT: use the versioned template model (has versions[])
import { TemplateModel } from "../models/TemplateV";

dotenv.config();

/* ---------- helpers ---------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

const ABS = /^https?:\/\//i;

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 } // 5 minutes
    );
  } catch (e) {
    console.warn("Blogs presign failed:", key, e);
    return "";
  }
}

/** Keep only S3 keys. If absolute URL → return "" so we never persist it. */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip legacy dev absolute path if any
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // never store absolute URLs in DB
  if (ABS.test(k)) return "";
  // trim leading slashes
  k = k.replace(/^\/+/, "");
  return k;
}

/* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p: string, tag = "v1") => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  if (p.startsWith("assets/"))
    return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
  return p;
};

/** pick defaults from versions[] or legacy field */
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

/* ----- Hardcoded SIR defaults (3 posts with template absolute URLs) ----- */
function sirBlogDefaults(templateId: string, tag = "v1") {
  // NOTE: Bayone demo uses b1.jpg/b2.jpg/b3.jpg
  const img = (n: number) => absolutizeTemplateAsset(templateId, `assets/imgs/blog/b${n}.jpg`, tag);
  return [
    {
      title: "Design that sparks emotion",
      excerpt:
        "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
      tag: "News",
      date: "2023-09-01",
      href: "blog-details.html",
      delay: ".2",
      order: 0,
      imageUrl: img(1),
      imageKey: "",
    },
    {
      title: "Shaping brands with clarity",
      excerpt:
        "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
      tag: "News",
      date: "2023-09-01",
      href: "blog-details.html",
      delay: ".3",
      order: 1,
      imageUrl: img(2),
      imageKey: "",
    },
    {
      title: "From idea to identity",
      excerpt:
        "Taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole.",
      tag: "News",
      date: "2023-09-01",
      href: "blog-details.html",
      delay: ".4",
      order: 2,
      imageUrl: img(3),
      imageKey: "",
    },
  ];
}

/* ---------- controllers ---------- */

/** GET posts with priority: user override → template version defaults → hardcoded SIR → [] */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // 1) User override in DB
    const doc = await Blog.findOne({ userId, templateId }).lean();
    if (doc && Array.isArray(doc.items) && doc.items.length) {
      const items = await Promise.all(
        (doc.items || []).map(async (it: any) => {
          const raw = String(it?.imageUrl || "");
          const img = ABS.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
          return {
            ...it,
            imageKey: ABS.test(raw) ? "" : raw, // if we stored key, expose it as imageKey
            imageUrl: img,                       // always absolute here
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
        .filter((s: any) => {
          const t = String(s?.type || "").toLowerCase();
          return (
            t === "blogs" ||
            t === "blog" ||
            t === "news" ||
            t === "posts" ||
            t === "bloglist"
          );
        })
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (fallback) {
      const arr = Array.isArray(fallback?.content?.items)
        ? fallback.content.items
        : Array.isArray(fallback?.content?.posts)
        ? fallback.content.posts
        : [];

      if (arr.length) {
        const items = await Promise.all(
          arr.map(async (p: any, i: number) => {
            const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
            let imageUrl = "";
            let imageKey = "";

            if (ABS.test(candidate)) {
              imageUrl = candidate; // absolute URL already
            } else if (candidate.startsWith("assets/")) {
              imageUrl = absolutizeTemplateAsset(templateId, candidate, tagUsed);
            } else if (candidate) {
              imageKey = candidate;               // S3 key stored in template
              imageUrl = await presignOrEmpty(candidate);
            }

            return {
              title: String(p?.title ?? ""),
              excerpt: String(p?.excerpt ?? ""),
              tag: String(p?.tag ?? ""),
              date: String(p?.date ?? ""),
              href: String(p?.href ?? "blog-details.html"),
              delay: String(p?.delay ?? `.${(i % 3) + 2}`),
              order: Number.isFinite(p?.order) ? Number(p?.order) : i,
              imageUrl,
              imageKey,
            };
          })
        );

        return res.json({ _source: "template", userId, templateId, items, version: tagUsed });
      }
    }

    // 3) Hardcoded SIR defaults (with absolute template URLs)
    if (templateId === "sir-template-1") {
      return res.json({
        _source: "hardcoded",
        userId,
        templateId,
        items: sirBlogDefaults(templateId),
      });
    }

    // 4) nothing
    return res.json({ _source: "template-none", userId, templateId, items: [] });
  } catch (e) {
    console.error("getBlogs error:", e);
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

/** PUT replace list (PRESERVE previous image key unless a new key is sent) */
export const upsertBlogs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const incoming = Array.isArray((req.body as any)?.items)
      ? (req.body as any).items
      : [];

    const existing = await Blog.findOne({ userId, templateId }).lean();
    const prev = Array.isArray(existing?.items) ? existing!.items : [];

    const norm = incoming.map((it: any, i: number) => {
      const candKey = cleanKey(it?.imageKey ?? it?.imageUrl); // key if provided
      const prevKey = prev[i]?.imageUrl || "";                // stored as key in DB
      const finalKey = candKey || prevKey;                    // preserve old key

      const order = Number.isFinite(it?.order)
        ? Number(it.order)
        : (prev[i]?.order ?? i);

      const { imageKey, imageUrl, ...rest } = it || {};
      return {
        ...rest,
        imageUrl: finalKey, // always a key or ""
        order,
      };
    });

    const updated = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: norm } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Blogs saved", result: updated });
  } catch (e) {
    console.error("upsertBlogs error:", e);
    return res.status(500).json({ error: "Failed to save blogs" });
  }
};

/** POST add one (accept key if sent; otherwise leave empty) */
export const addBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const b = (req.body || {}) as any;

    const candKey = cleanKey(b?.imageKey ?? b?.imageUrl); // key only
    const { imageKey, imageUrl, ...rest } = b || {};

    const doc = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $push: { items: { ...rest, imageUrl: candKey || "" } } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Blog added", result: doc });
  } catch (e) {
    console.error("addBlog error:", e);
    return res.status(500).json({ error: "Failed to add blog" });
  }
};

/** PUT update one by :postId (only change image when a NEW key is sent) */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const u = (req.body || {}) as any;

    const set: any = {};
    for (const k of ["title", "excerpt", "tag", "date", "href", "delay", "order"]) {
      if (u[k] !== undefined) set[`items.$.${k}`] = k === "order" ? Number(u[k]) : u[k];
    }

    const candKey = cleanKey(u?.imageKey ?? u?.imageUrl); // key only; ignore absolute
    if (candKey) set["items.$.imageUrl"] = candKey;

    const doc = await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: set },
      { new: true }
    );

    return res.json({ message: "✅ Blog updated", result: doc });
  } catch (e) {
    console.error("updateBlog error:", e);
    return res.status(500).json({ error: "Failed to update blog" });
  }
};

/** DELETE one by :postId */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const doc = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $pull: { items: { _id: postId } } },
      { new: true }
    );
    return res.json({ message: "✅ Blog removed", result: doc });
  } catch (e) {
    console.error("deleteBlog error:", e);
    return res.status(500).json({ error: "Failed to delete image" });
  }
};

/** POST image multipart → save S3 key into this post */
export const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key;

    const updated = await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: { "items.$.imageUrl": key } },
      { new: true }
    );

    return res.json({
      message: "✅ Blog image uploaded",
      key,
      result: updated,
    });
  } catch (e) {
    console.error("uploadBlogImage error:", e);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};

/** DELETE image from S3 and clear field */
export const deleteBlogImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;

    const doc = await Blog.findOne({ userId, templateId });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const item = (doc.items || []).find((x: any) => String(x._id) === postId);
    if (!item || !item.imageUrl) return res.status(404).json({ error: "No image set" });

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: item.imageUrl as string,
        })
      );
    } catch {
      /* ignore delete failures */
    }

    await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: { "items.$.imageUrl": "" } },
      { new: true }
    );

    return res.json({ message: "✅ Image removed" });
  } catch (e) {
    console.error("deleteBlogImage error:", e);
    return res.status(500).json({ error: "Failed to delete image" });
  }
};

/** POST: RESET — delete override so GET falls back to template/hardcoded */
export const resetBlogs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await Blog.deleteMany({ userId, templateId });
    return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
  } catch (e) {
    console.error("resetBlogs error:", e);
    return res.status(500).json({ error: "Failed to reset blogs" });
  }
};
