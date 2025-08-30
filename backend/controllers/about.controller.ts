
// // og
// // backend/controllers/about.controller.ts
// import { Request, Response } from "express";
// import About from "../models/About";

// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// export const getAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await About.findOne({ userId, templateId });
//   if (!doc) return res.json({});

//   let signedUrl = "";
//   if (doc.imageUrl) {
//     signedUrl = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.imageUrl as string, // S3 object key stored in DB
//       }),
//       { expiresIn: 60 }
//     );
//   }

//   // Return raw key + a viewable URL
//   const obj = doc.toObject();
//   return res.json({
//     ...obj,
//     imageKey: obj.imageUrl || "",
//     imageUrl: signedUrl,
//   });
// };

// export const upsertAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { imageKey, imageUrl, ...rest } = req.body as any;

//   const update: any = { ...rest };
//   const key = imageKey || imageUrl;
//   if (key) update.imageUrl = key; // store S3 key

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     { $set: update },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ About saved", result: doc });
// };

// // -------- image upload helpers (multer-s3 sets req.file.key) --------
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key;       // e.g. sections/about/....
//   const bucket: string = file.bucket; // project1-uploads-12345

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { imageUrl: key } },      // store S3 key
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ Image uploaded", key, bucket, result: doc });
// };

// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await About.findOne({ userId, templateId });
//   if (!doc || !doc.imageUrl) {
//     return res.status(404).json({ error: "No image set" });
//   }

//   // try to delete the object in S3 (optional but cleaner)
//   try {
//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.imageUrl as string,
//       })
//     );
//   } catch {
//     // ignore delete failures; we still clear the DB
//   }

//   doc.imageUrl = "";
//   await doc.save();

//   res.json({ message: "✅ Image removed", result: doc });
// };







// backend/controllers/about.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import About from "../models/About";

dotenv.config();

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

/** GET: return whatever is stored (public URL only) */
export const getAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await About.findOne({ userId, templateId });
    if (!doc) {
      return res.json({
        title: "",
        description: "",
        bullets: [],
        highlight: "",
        imageUrl: "",
        imageKey: "", // legacy field for UI compatibility
      });
    }

    const obj = doc.toObject();
    return res.json({
      ...obj,
      imageUrl: obj.imageUrl || "",
      imageKey: "", // legacy
    });
  } catch (err) {
    console.error("Get About error:", err);
    return res.status(500).json({ error: "Failed to fetch About section" });
  }
};

/** PUT/POST: save text fields and/or imageUrl (must be public http(s) URL) */
export const upsertAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    // Extract image field (accept imageUrl or image)
    const incomingUrl = String(body.imageUrl ?? body.image ?? "").trim();

    // Everything else passes through (title, description, bullets, highlight, etc.)
    // but we will NOT trust any imageKey / S3 fields.
    const { imageKey, image, ...rest } = body;

    const update: Record<string, any> = { ...rest };

    if (incomingUrl) {
      if (!/^https?:\/\//i.test(incomingUrl)) {
        return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
      }
      update.imageUrl = incomingUrl;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({
      message: "✅ About saved",
      result: doc,
      imageUrl: doc.imageUrl || "",
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Save About error:", err);
    return res.status(500).json({ error: "Failed to save About section" });
  }
};

/** NEW: issue short-lived token + upload URL for cPanel (same as hero) */
export const getAboutUploadToken = async (req: Request, res: Response) => {
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
    console.error("getAboutUploadToken error:", e);
    return res.status(500).json({ error: "Failed to create upload token" });
  }
};

/** optional: clear only the image URL */
export const clearAboutImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({
      message: "Image cleared",
      imageUrl: doc?.imageUrl || "",
    });
  } catch (err) {
    console.error("Clear About image failed:", err);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};
