// // og code
// // controllers/hero.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import HeroSection from "../models/HeroSection";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// /** helper: get ids from params with safe defaults */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
// });

// /** POST: generate hero text (optional feature) */
// export const generateHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const textPrompt =
//       "Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.";

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: textPrompt }],
//     });

//     const content = completion.choices[0].message?.content?.trim() || "";

//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { content },
//       { upsert: true, new: true }
//     );

//     return res.json({
//       content: updated.content,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Hero text generation failed:", err);
//     return res.status(500).json({ error: "Failed to generate hero text" });
//   }
// };

// /** PUT/POST: save text and/or imageKey (S3 key stored in imageUrl field) */
// export const upsertHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const body = (req.body || {}) as any;

//     const rawContent = body.content ?? body.data?.content ?? "";
//     const content = String(rawContent ?? "");

//     // accept either imageKey or imageUrl from client; store S3 key in imageUrl
//     const keyCandidate = String(body.imageKey ?? body.imageUrl ?? "");
//     let imageKey = keyCandidate;

//     // strip any accidental local filesystem prefix
//     if (imageKey) {
//       imageKey = imageKey.replace(
//         /^\/home\/ec2-user\/apps\/backend\/uploads\//,
//         ""
//       );
//       // ignore if someone sent a full http(s) URL instead of a key
//       if (/^https?:\/\//i.test(imageKey)) imageKey = "";
//     }

//     const update: Record<string, any> = {};
//     if (content.trim()) update.content = content;
//     if (imageKey) update.imageUrl = imageKey;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { upsert: true, new: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ Saved",
//       content: doc.content,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (err: any) {
//     if (err?.name === "ValidationError") {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("Save Hero error:", err);
//     return res.status(500).json({ error: "Failed to save Hero section" });
//   }
// };

// /** GET: content + presigned URL (if key exists) */
// export const getHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const hero = await HeroSection.findOne({ userId, templateId });
//     if (!hero) return res.json({ content: "", imageUrl: "", imageKey: "" });

//     let signedUrl = "";
//     if (hero.imageUrl) {
//       try {
//         signedUrl = await getSignedUrl(
//           s3,
//           new GetObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: hero.imageUrl as string,
//           }),
//           { expiresIn: 300 }
//         );
//       } catch (e) {
//         console.warn("Presign failed for key:", hero.imageUrl, e);
//       }
//     }

//     return res.json({
//       content: hero.content,
//       imageUrl: signedUrl,
//       imageKey: hero.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Get Hero error:", err);
//     return res.status(500).json({ error: "Failed to fetch Hero section" });
//   }
// };

// /** POST /image: upload via multer-s3 and store S3 key */
// export const uploadHeroImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No image uploaded" });

//   const key: string = file.key;       // e.g. "sections/hero/<timestamp>-<name>.jpg"
//   const bucket: string = file.bucket;

//   try {
//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },     // store S3 key in imageUrl
//       { new: true, upsert: true }
//     );

//     const imageUrl = await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );

//     return res.json({
//       message: "✅ Hero image uploaded",
//       bucket,
//       key,
//       imageUrl,
//       imageKey: doc.imageUrl || ""
//     });
//   } catch (err) {
//     console.error("Upload Hero Image error:", err);
//     return res.status(500).json({ error: "Failed to upload hero image" });
//   }
// };

// /** optional: clear only the image key */
// export const clearHeroImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
//   } catch (err) {
//     console.error("Clear image failed:", err);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };









// // backend/controllers/hero.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import HeroSection from "../models/HeroSection";
// import { TemplateModel } from "../models/Template";// <-- default export (change if you use named export)
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// /** ---------- helpers ---------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
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
//     console.warn("Presign failed for key:", key, e);
//     return { imageUrl: "", imageKey: key || "" };
//   }
// }

// /** ---------- handlers ---------- */

// /** POST: AI-generate hero text (optional) */
// export const generateHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const textPrompt =
//       "Write a gym coach website hero headline (1-2 lines). Include brand/name, role, and motivation. Return plain text only.";

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: textPrompt }],
//     });

//     const content = completion.choices[0].message?.content?.trim() || "";

//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { content },
//       { upsert: true, new: true }
//     );

//     return res.json({
//       content: updated.content || "",
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Hero text generation failed:", err);
//     return res.status(500).json({ error: "Failed to generate hero text" });
//   }
// };

// /** PUT/POST: save text and/or imageKey (store S3 key in imageUrl) */
// export const upsertHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const body = (req.body || {}) as any;

//     const rawContent = body.content ?? body.data?.content ?? "";
//     const content = typeof rawContent === "string" ? rawContent : "";

//     // accept either imageKey or imageUrl; we store *key* in imageUrl
//     const keyCandidate = String(body.imageKey ?? body.imageUrl ?? "");
//     let imageKey = keyCandidate;

//     if (imageKey) {
//       // drop accidental local path
//       imageKey = imageKey.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//       // if someone sends full http(s) URL, ignore as a key
//       if (/^https?:\/\//i.test(imageKey)) imageKey = "";
//     }

//     const update: Record<string, any> = {};
//     if (typeof content === "string") update.content = content;
//     if (imageKey) update.imageUrl = imageKey;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { upsert: true, new: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ Saved",
//       content: doc.content || "",
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (err: any) {
//     if (err?.name === "ValidationError") {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("Save Hero error:", err);
//     return res.status(500).json({ error: "Failed to save Hero section" });
//   }
// };

// /** GET: user override OR fallback to template default */
// export const getHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const hero = await HeroSection.findOne({ userId, templateId });
//     if (hero && (hero.content || hero.imageUrl)) {
//       const signed = await presignOrEmpty(hero.imageUrl);
//       return res.json({
//         _source: "user",
//         content: hero.content || "",
//         imageUrl: signed.imageUrl,
//         imageKey: signed.imageKey,
//       });
//     }

//     // 2) template default (first 'hero' section)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];

//     const fallback = defaults
//       .filter((s: any) => s?.type === "hero")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (!fallback) {
//       return res.json({
//         _source: "template-none",
//         content: "",
//         imageUrl: "",
//         imageKey: "",
//       });
//     }

//     const fContent = String(
//       fallback.content?.content ??
//       fallback.content?.text ??
//       fallback.content ??
//       ""
//     );

//     let imageUrl = "";
//     let imageKey = "";

//     if (fallback.content?.imageKey) {
//       const signed = await presignOrEmpty(String(fallback.content.imageKey));
//       imageUrl = signed.imageUrl;
//       imageKey = signed.imageKey;
//     } else if (fallback.content?.imageUrl && /^https?:\/\//i.test(fallback.content.imageUrl)) {
//       imageUrl = String(fallback.content.imageUrl);
//     }

//     return res.json({
//       _source: "template",
//       content: fContent,
//       imageUrl,
//       imageKey,
//     });
//   } catch (err) {
//     console.error("Get Hero error:", err);
//     return res.status(500).json({ error: "Failed to fetch Hero section" });
//   }
// };

// /** POST: reset hero (delete user override → fallback on next GET) */
// export const resetHero = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await HeroSection.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (err) {
//     console.error("Reset Hero error:", err);
//     return res.status(500).json({ error: "Failed to reset Hero section" });
//   }
// };

// /** POST /image: multer-s3 upload; store S3 key in imageUrl; return presigned URL */
// export const uploadHeroImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No image uploaded" });

//   const key: string = file.key;       // e.g. "sections/hero/<timestamp>-<name>.jpg"
//   const bucket: string = file.bucket;

//   try {
//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);

//     return res.json({
//       message: "✅ Hero image uploaded",
//       bucket,
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || ""
//     });
//   } catch (err) {
//     console.error("Upload Hero Image error:", err);
//     return res.status(500).json({ error: "Failed to upload hero image" });
//   }
// };

// /** OPTIONAL JSON/base64 upload (works with application/json) */
// export const uploadHeroImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     // ----- filename + extension fix (prevents .jpg.jpg) -----
//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       // infer from dataUrl if provided
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/hero/${Date.now()}-${base}${ext}`;
//     // --------------------------------------------------------

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(new PutObjectCommand({
//       Bucket: process.env.S3_BUCKET!,
//       Key: key,
//       Body: buf,
//       ContentType:
//         ext === ".png" ? "image/png" :
//         ext === ".webp" ? "image/webp" :
//         ext === ".gif" ? "image/gif" : "image/jpeg",
//       ACL: "private",
//     }));

//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);

//     return res.json({
//       message: "✅ Hero image uploaded (base64)",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || ""
//     });
//   } catch (e) {
//     console.error("Upload base64 failed:", e);
//     return res.status(500).json({ error: "Failed to upload base64 image" });
//   }
// };

// /** POST: clear only the image key (keep text) */
// export const clearHeroImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
//   } catch (err) {
//     console.error("Clear image failed:", err);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };











































// video url



import { Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import HeroSection from "../models/HeroSection";
import { TemplateModel } from "../models/Template";
import { s3 } from "../lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "gym-template-1",
});

async function presign(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Presign failed for key:", key, e);
    return "";
  }
}

/* ---------------- handlers ---------------- */

export const generateHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const textPrompt =
      "Write a gym coach website hero headline (1-2 lines). Include brand/name, role, and motivation. Return plain text only.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: textPrompt }],
    });

    const content = completion.choices[0].message?.content?.trim() || "";

    const updated = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { content },
      { upsert: true, new: true }
    );

    return res.json({
      content: updated.content || "",
      imageKey: updated.imageUrl || "",
      videoKey: updated.videoKey || "",
      posterKey: updated.posterKey || "",
    });
  } catch (err) {
    console.error("Hero text generation failed:", err);
    return res.status(500).json({ error: "Failed to generate hero text" });
  }
};

/** PUT/POST: save headline + (optional) imageKey + (optional) videoKey/posterKey */
export const upsertHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    const rawContent = body.content ?? body.data?.content ?? "";
    const content = typeof rawContent === "string" ? rawContent : "";

    // accept either ...Key or ...Url (we store only keys)
    const cleanKey = (v: unknown) => {
      let k = String(v || "");
      k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
      if (/^https?:\/\//i.test(k)) k = "";
      return k;
    };

    const imageKey  = cleanKey(body.imageKey  ?? body.imageUrl);
    const videoKey  = cleanKey(body.videoKey  ?? body.videoUrl);
    const posterKey = cleanKey(body.posterKey ?? body.posterUrl);

    const update: Record<string, any> = {};
    if (typeof content === "string") update.content = content;
    if (imageKey) update.imageUrl = imageKey;
    if (videoKey) update.videoKey = videoKey;
    if (posterKey) update.posterKey = posterKey;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({
      message: "✅ Saved",
      content: doc.content || "",
      imageKey: doc.imageUrl || "",
      videoKey: doc.videoKey || "",
      posterKey: doc.posterKey || "",
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Save Hero error:", err);
    return res.status(500).json({ error: "Failed to save Hero section" });
  }
};

/** GET: user override OR fallback to template default */
export const getHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const hero = await HeroSection.findOne({ userId, templateId });
    if (hero && (hero.content || hero.imageUrl || hero.videoKey)) {
      return res.json({
        _source: "user",
        content: hero.content || "",
        imageUrl: await presign(hero.imageUrl),
        imageKey: hero.imageUrl || "",
        videoUrl: await presign(hero.videoKey),
        videoKey: hero.videoKey || "",
        posterUrl: await presign(hero.posterKey),
        posterKey: hero.posterKey || "",
      });
    }

    // 2) template default (first 'hero' section)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
    const fallback = defaults
      .filter((s: any) => s?.type === "hero")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    if (!fallback) {
      return res.json({
        _source: "template-none",
        content: "",
        imageUrl: "",
        imageKey: "",
        videoUrl: "",
        videoKey: "",
        posterUrl: "",
        posterKey: "",
      });
    }

    const fContent = String(
      fallback.content?.content ??
        fallback.content?.text ??
        fallback.content ??
        ""
    );

    let imageUrl = "";
    if (fallback.content?.imageKey) imageUrl = await presign(String(fallback.content.imageKey));
    else if (fallback.content?.imageUrl && /^https?:\/\//i.test(fallback.content.imageUrl)) {
      imageUrl = String(fallback.content.imageUrl);
    }

    let videoUrl = "";
    if (fallback.content?.videoKey) videoUrl = await presign(String(fallback.content.videoKey));
    else if (fallback.content?.videoUrl && /^https?:\/\//i.test(fallback.content.videoUrl)) {
      videoUrl = String(fallback.content.videoUrl);
    }

    let posterUrl = "";
    if (fallback.content?.posterKey) posterUrl = await presign(String(fallback.content.posterKey));
    else if (fallback.content?.posterUrl && /^https?:\/\//i.test(fallback.content.posterUrl)) {
      posterUrl = String(fallback.content.posterUrl);
    }

    return res.json({
      _source: "template",
      content: fContent,
      imageUrl,
      imageKey: String(fallback.content?.imageKey || ""),
      videoUrl,
      videoKey: String(fallback.content?.videoKey || ""),
      posterUrl,
      posterKey: String(fallback.content?.posterKey || ""),
    });
  } catch (err) {
    console.error("Get Hero error:", err);
    return res.status(500).json({ error: "Failed to fetch Hero section" });
  }
};

/** POST /image: upload hero image (field: image) */
export const uploadHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No image uploaded" });

  const key: string = file.key;
  const bucket: string = file.bucket;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "✅ Hero image uploaded",
      bucket,
      key,
      imageUrl: await presign(key),
      imageKey: doc.imageUrl || "",
    });
  } catch (err) {
    console.error("Upload Hero Image error:", err);
    return res.status(500).json({ error: "Failed to upload hero image" });
  }
};

/** POST /video: upload hero video (field: video) */
export const uploadHeroVideo = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No video uploaded" });

  const key: string = file.key;
  const bucket: string = file.bucket;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { videoKey: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "🎬 Hero video uploaded",
      bucket,
      key,
      videoUrl: await presign(key),
      videoKey: doc.videoKey || "",
    });
  } catch (err) {
    console.error("Upload Hero Video error:", err);
    return res.status(500).json({ error: "Failed to upload hero video" });
  }
};

/** POST /poster: upload poster image (field: poster) */
export const uploadHeroPoster = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No poster uploaded" });

  const key: string = file.key;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { posterKey: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "🖼️ Poster uploaded",
      posterUrl: await presign(key),
      posterKey: doc.posterKey || "",
    });
  } catch (err) {
    console.error("Upload Poster error:", err);
    return res.status(500).json({ error: "Failed to upload poster image" });
  }
};

export const clearHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
  } catch (err) {
    console.error("Clear image failed", err);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};

export const clearHeroVideo = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { videoKey: "", posterKey: "" } },
      { new: true }
    );
    return res.json({
      message: "Video cleared",
      videoKey: doc?.videoKey || "",
      posterKey: doc?.posterKey || "",
    });
  } catch (err) {
    console.error("Clear video failed", err);
    return res.status(500).json({ error: "Failed to clear video" });
  }
};
