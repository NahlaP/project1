

// import { Request, Response } from "express";
// import Testimonial from "../models/Testimonial";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
//   PutObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   if (/^\/uploads\//.test(String(key))) return ""; // legacy local path
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: String(key) }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Presign failed:", key, e);
//     return "";
//   }
// }

// function cleanKeyCandidate(candidate?: string) {
//   let key = String(candidate ?? "");
//   if (!key) return "";
//   key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, ""); // strip accidental local path
//   if (/^https?:\/\//i.test(key)) return ""; // we store S3 key only (not full URL)
//   return key;
// }

// /* ---------------- handlers ---------------- */

// // GET all testimonials (returns imageKey + presigned imageUrl)
// export const getTestimonials = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });

//     const withUrls = await Promise.all(
//       rows.map(async (t) => {
//         const obj = t.toObject();
//         const imageKey = obj.imageUrl || "";
//         const imageUrl = await presignOrEmpty(imageKey);
//         return { ...obj, imageKey, imageUrl };
//       })
//     );

//     return res.status(200).json(withUrls);
//   } catch (err) {
//     console.error("getTestimonials error:", err);
//     return res.status(500).json({ error: "Failed to fetch testimonials" });
//   }
// };

// // CREATE testimonial (multipart optional OR body.imageKey/body.imageUrl)
// export const createTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { name, profession, message, rating } = (req.body || {}) as any;

//     const file = (req as any).file;
//     const incomingKey =
//       file?.key ||
//       cleanKeyCandidate((req.body as any).imageKey ?? (req.body as any).imageUrl) ||
//       "";

//     const row = await Testimonial.create({
//       userId,
//       templateId,
//       name,
//       profession,
//       message,
//       rating: rating !== undefined ? Number(rating) : undefined,
//       imageUrl: incomingKey, // store S3 key
//     });

//     return res.status(201).json({
//       message: "✅ Testimonial created",
//       data: {
//         ...row.toObject(),
//         imageKey: row.imageUrl || "",
//         imageUrl: await presignOrEmpty(row.imageUrl),
//       },
//     });
//   } catch (err: any) {
//     if (err?.name === "ValidationError") {
//       return res.status(400).json({
//         error: "Validation failed",
//         details: Object.fromEntries(
//           Object.entries(err.errors || {}).map(([k, v]: any) => [k, v.message])
//         ),
//       });
//     }
//     console.error("createTestimonial error:", err);
//     return res.status(500).json({ error: "Failed to create testimonial" });
//   }
// };

// // UPDATE testimonial (fields + optional new image or imageKey)
// export const updateTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, profession, message, rating, imageKey, imageUrl, removeImage } =
//       (req.body || {}) as any;

//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     if (name !== undefined) row.name = name;
//     if (profession !== undefined) row.profession = profession;
//     if (message !== undefined) row.message = message;
//     if (rating !== undefined) row.rating = Number(rating);

//     const file = (req as any).file;
//     if (file?.key) {
//       row.imageUrl = file.key;
//     } else {
//       const key = cleanKeyCandidate(imageKey ?? imageUrl);
//       if (key) {
//         row.imageUrl = key;
//       } else if (removeImage === "true" || removeImage === true) {
//         if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
//           try {
//             await s3.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.S3_BUCKET!,
//                 Key: row.imageUrl,
//               })
//             );
//           } catch {
//             // ignore delete errors
//           }
//         }
//         row.imageUrl = "";
//       }
//     }

//     const updated = await row.save();
//     return res.status(200).json({
//       message: "✅ Testimonial updated",
//       data: {
//         ...updated.toObject(),
//         imageKey: updated.imageUrl || "",
//         imageUrl: await presignOrEmpty(updated.imageUrl),
//       },
//     });
//   } catch (err) {
//     console.error("updateTestimonial error:", err);
//     return res.status(500).json({ error: "Failed to update testimonial" });
//   }
// };

// // DELETE testimonial (+ best-effort delete image from S3)
// export const deleteTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
//       try {
//         await s3.send(
//           new DeleteObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: row.imageUrl,
//           })
//         );
//       } catch {
//         // ignore
//       }
//     }

//     await Testimonial.findByIdAndDelete(id);
//     return res.status(200).json({ message: "✅ Testimonial deleted" });
//   } catch (err) {
//     console.error("deleteTestimonial error:", err);
//     return res.status(500).json({ error: "Failed to delete testimonial" });
//   }
// };

// // OPTIONAL: JSON/base64 upload (attach to an existing testimonial ID)
// export const uploadTestimonialImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { id, userId, templateId } = req.params;
//     const row = await Testimonial.findOne({ _id: id, userId, templateId });
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const key = `sections/testimonials/${id}/${Date.now()}-${base}${ext}`;
//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: Buffer.from(b64, "base64"),
//         ContentType:
//           ext === ".png" ? "image/png" :
//           ext === ".webp" ? "image/webp" :
//           ext === ".gif" ? "image/gif" : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     row.imageUrl = key;
//     const updated = await row.save();

//     return res.json({
//       message: "✅ Testimonial image uploaded (base64)",
//       data: {
//         ...updated.toObject(),
//         imageKey: updated.imageUrl || "",
//         imageUrl: await presignOrEmpty(updated.imageUrl),
//       },
//     });
//   } catch (e) {
//     console.error("uploadTestimonialImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload testimonial image (base64)" });
//   }
// };














// backend/controllers/testimonial.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import Testimonial from "../models/Testimonial";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Versioned templates (TemplateV with versions[].defaultSections)
import { TemplateModel } from "../models/TemplateV";

/* ---------------- helpers ---------------- */
const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  // Ignore legacy local paths
  if (/^\/uploads\//.test(String(key))) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: String(key) }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Presign failed:", key, e);
    return "";
  }
}

function cleanKeyCandidate(candidate?: string) {
  let key = String(candidate ?? "");
  if (!key) return "";
  // strip accidental local upload folder
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // store S3 keys only (not full URLs)
  if (ABS.test(key)) return "";
  return key.replace(/^\/+/, "");
}

const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

/** Turn template-relative asset paths into full CDN URLs. */
function absolutizeTemplateAsset(templateId: string, p?: string, tag = "v1") {
  const raw = String(p || "").trim();
  if (!raw) return "";
  if (ABS.test(raw)) return raw;

  const path = raw.replace(/^\/+/, ""); // normalize

  // Common shapes from templates:
  // - assets/img/foo.jpg   -> base + assets/img/foo.jpg
  // - img/foo.jpg          -> base + assets/img/foo.jpg
  // - images/foo.jpg       -> base + assets/images/foo.jpg
  if (path.startsWith("assets/")) {
    return templateCdnBase(templateId, tag) + path;
  }
  if (path.startsWith("img/")) {
    return templateCdnBase(templateId, tag) + "assets/" + path;
  }
  if (path.startsWith("images/")) {
    return templateCdnBase(templateId, tag) + "assets/" + path;
  }

  // Best effort: still make it absolute under the version root
  return templateCdnBase(templateId, tag) + path;
}

function pickVersionDefaults(tpl: any, verTag?: string): { tagUsed: string; defaults: any[] } {
  let tagUsed = "legacy";
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag && tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    return { tagUsed, defaults: Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [] };
  }
  return { tagUsed, defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [] };
}

/** Normalize one item from template defaults into our response shape */
async function normalizeTemplateItem(
  x: any,
  i: number,
  templateId: string,
  tagUsed: string
) {
  const name =
    (typeof x?.name === "string" && x.name) ||
    (typeof x?.title === "string" && x.title) ||
    "";
  const profession =
    (typeof x?.profession === "string" && x.profession) ||
    (typeof x?.role === "string" && x.role) ||
    "";
  const message =
    (typeof x?.message === "string" && x.message) ||
    (typeof x?.text === "string" && x.text) ||
    "";
  const rating = Number.isFinite(x?.rating) ? Number(x.rating) : undefined;

  const rawImg = String(x?.imageUrl ?? x?.image ?? x?.avatar ?? x?.img ?? "").trim();

  let imageUrl = "";
  let imageKey = "";

  // ✅ handle img/... , images/... , assets/... and absolute urls
  const cdnUrl = absolutizeTemplateAsset(templateId, rawImg, tagUsed);
  if (cdnUrl && !ABS.test(rawImg)) {
    // We produced a CDN URL from a relative path
    imageUrl = cdnUrl;
  } else if (ABS.test(rawImg)) {
    imageUrl = rawImg;
  } else if (rawImg) {
    // treat non-absolute, non-assets paths as S3 keys
    imageKey = rawImg;
    imageUrl = await presignOrEmpty(rawImg);
  }

  return {
    _id: `tpl-${i}`, // synthetic id for UI keying in template mode
    name,
    profession,
    message,
    rating,
    imageKey,
    imageUrl,
  };
}

/* ---------------- handlers ---------------- */

/**
 * GET testimonials
 * Priority: user overrides → template defaults → empty
 * Optional: add ?flat=1 to return a plain array (for legacy UIs)
 */
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();
    const flat = /^(1|true|yes)$/i.test(String(req.query?.flat || ""));

    // 1) user overrides
    const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });
    if (rows.length) {
      const withUrls = await Promise.all(
        rows.map(async (t) => {
          const obj = t.toObject();
          const imageKey = obj.imageUrl || "";
          const imageUrl = await presignOrEmpty(imageKey);
          return { ...obj, imageKey, imageUrl };
        })
      );
      return flat
        ? res.status(200).json(withUrls)
        : res.status(200).json({ _source: "user", version: verTag || null, items: withUrls });
    }

    // 2) template version defaults (type: testimonials | testimonial)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const sec =
      (defaults || [])
        .filter((s: any) => {
          const t = String(s?.type || "").toLowerCase();
          return t === "testimonials" || t === "testimonial";
        })
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (sec?.content) {
      const c = sec.content;
      const list =
        (Array.isArray(c.items) && c.items) ||
        (Array.isArray(c.testimonials) && c.testimonials) ||
        (Array.isArray(c) ? c : []);

      const mapped = await Promise.all(
        list.map((x: any, i: number) => normalizeTemplateItem(x, i, templateId, tagUsed))
      );

      return flat
        ? res.status(200).json(mapped)
        : res.status(200).json({ _source: "template", version: tagUsed, items: mapped });
    }

    // 3) empty
    return flat
      ? res.status(200).json([])
      : res.status(200).json({ _source: "template-none", version: verTag || null, items: [] });
  } catch (err) {
    console.error("getTestimonials error:", err);
    return res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// CREATE testimonial (multipart optional OR body.imageKey/body.imageUrl)
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { name, profession, message, rating } = (req.body || {}) as any;

    const file = (req as any).file;
    const incomingKey =
      file?.key ||
      cleanKeyCandidate((req.body as any).imageKey ?? (req.body as any).imageUrl) ||
      "";

    const row = await Testimonial.create({
      userId,
      templateId,
      name,
      profession,
      message,
      rating: rating !== undefined ? Number(rating) : undefined,
      imageUrl: incomingKey, // store S3 key
    });

    return res.status(201).json({
      message: "✅ Testimonial created",
      data: {
        ...row.toObject(),
        imageKey: row.imageUrl || "",
        imageUrl: await presignOrEmpty(row.imageUrl),
      },
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: Object.fromEntries(
          Object.entries(err.errors || {}).map(([k, v]: any) => [k, (v as any).message])
        ),
      });
    }
    console.error("createTestimonial error:", err);
    return res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// UPDATE testimonial (fields + optional new image or imageKey)
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, profession, message, rating,
      imageKey, imageUrl, removeImage
    } = (req.body || {}) as any;

    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (name !== undefined) row.name = name;
    if (profession !== undefined) row.profession = profession;
    if (message !== undefined) row.message = message;
    if (rating !== undefined) row.rating = Number(rating);

    const file = (req as any).file;
    if (file?.key) {
      row.imageUrl = file.key;
    } else {
      const key = cleanKeyCandidate(imageKey ?? imageUrl);
      if (key) {
        row.imageUrl = key;
      } else if (removeImage === "true" || removeImage === true) {
        if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: row.imageUrl,
              })
            );
          } catch {
            // ignore delete errors
          }
        }
        row.imageUrl = "";
      }
    }

    const updated = await row.save();
    return res.status(200).json({
      message: "✅ Testimonial updated",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: await presignOrEmpty(updated.imageUrl),
      },
    });
  } catch (err) {
    console.error("updateTestimonial error:", err);
    return res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// DELETE testimonial (+ best-effort delete image from S3)
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: row.imageUrl,
          })
        );
      } catch {
        // ignore
      }
    }

    await Testimonial.findByIdAndDelete(id);
    return res.status(200).json({ message: "✅ Testimonial deleted" });
  } catch (err) {
    console.error("deleteTestimonial error:", err);
    return res.status(500).json({ error: "Failed to delete testimonial" });
  }
};

// OPTIONAL: JSON/base64 upload (attach to an existing testimonial ID)
export const uploadTestimonialImageBase64 = async (req: Request, res: Response) => {
  try {
    const { id, userId, templateId } = req.params;
    const row = await Testimonial.findOne({ _id: id, userId, templateId });
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const key = `sections/testimonials/${id}/${Date.now()}-${base}${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: Buffer.from(b64, "base64"),
        ContentType:
          ext === ".png" ? "image/png" :
          ext === ".webp" ? "image/webp" :
          ext === ".gif" ? "image/gif" : "image/jpeg",
        ACL: "private",
      })
    );

    row.imageUrl = key;
    const updated = await row.save();

    return res.json({
      message: "✅ Testimonial image uploaded (base64)",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: await presignOrEmpty(updated.imageUrl),
      },
    });
  } catch (e) {
    console.error("uploadTestimonialImageBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload testimonial image (base64)" });
  }
};
