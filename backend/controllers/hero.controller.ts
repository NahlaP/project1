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









// controllers/hero.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import HeroSection from "../models/HeroSection";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** helper: get ids from params with safe defaults */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "gym-template-1",
});

/** helper: sign short-lived JWT for cPanel upload */
function signUploadToken(payload: Record<string, any>) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Number(process.env.TOKEN_TTL_SECONDS || 180);
  return jwt.sign({ iat: now, exp, ...payload }, process.env.JWT_SECRET!, {
    algorithm: "HS256",
  });
}

/** POST: generate hero text (optional feature) */
export const generateHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const textPrompt =
      "Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.";

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
      content: updated.content,
      imageUrl: updated.imageUrl || "",
    });
  } catch (err) {
    console.error("Hero text generation failed:", err);
    return res.status(500).json({ error: "Failed to generate hero text" });
  }
};

/** NEW: issue short-lived token + upload URL for cPanel */
export const getHeroUploadToken = async (req: Request, res: Response) => {
  try {
    const { filename, size, type } = (req.body || {}) as any;
    if (!filename || !size || !type) {
      return res.status(400).json({ error: "filename, size, type required" });
    }
    const base = (process.env.CPANEL_BASE_URL || "").replace(/\/+$/, "");
    if (!base) {
      return res.status(500).json({ error: "CPANEL_BASE_URL not configured" });
    }
    const uploadUrl = `${base}/api/upload.php`;
    const token = signUploadToken({ scope: "upload", filename, size, type });
    return res.json({
      token,
      uploadUrl,
      expiresIn: Number(process.env.TOKEN_TTL_SECONDS || 180),
    });
  } catch (e) {
    console.error("getHeroUploadToken error:", e);
    return res.status(500).json({ error: "Failed to create upload token" });
  }
};

/** PUT/POST: save text and/or imageUrl (public HTTP URL from cPanel) */
export const upsertHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    const rawContent = body.content ?? body.data?.content ?? "";
    const content = String(rawContent ?? "").trim();

    // We only support direct public URLs (cPanel or any CDN) for images now
    const incomingUrl = String(body.imageUrl ?? body.image ?? "").trim();

    const update: Record<string, any> = {};
    if (content) update.content = content;

    if (incomingUrl) {
      if (!/^https?:\/\//i.test(incomingUrl)) {
        return res
          .status(400)
          .json({ error: "imageUrl must be a public http(s) URL" });
      }
      update.imageUrl = incomingUrl;
    }

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
      imageUrl: doc.imageUrl || "",
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Save Hero error:", err);
    return res.status(500).json({ error: "Failed to save Hero section" });
  }
};

/** GET: content + direct public URL (as stored) */
export const getHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const hero = await HeroSection.findOne({ userId, templateId });
    if (!hero) return res.json({ content: "", imageUrl: "", imageKey: "" });

    // No presigning — just return whatever is stored (public URL or empty)
    return res.json({
      content: hero.content || "",
      imageUrl: hero.imageUrl || "",
      imageKey: "", // legacy field kept for UI compatibility
    });
  } catch (err) {
    console.error("Get Hero error:", err);
    return res.status(500).json({ error: "Failed to fetch Hero section" });
  }
};

/** optional: clear only the image URL */
export const clearHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({
      message: "Image cleared",
      imageUrl: doc?.imageUrl || "",
    });
  } catch (err) {
    console.error("Clear image failed:", err);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};
