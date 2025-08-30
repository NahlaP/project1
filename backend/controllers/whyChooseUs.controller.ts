

// // // og
// import { Request, Response } from "express";
// import WhyChooseUs from "../models/WhyChooseUs";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// export const getWhyChooseUs = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const data = await WhyChooseUs.findOne({ userId, templateId });
//   if (!data) return res.json({});

//   let signed = "";
//   if (data.bgImageUrl) {
//     signed = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: data.bgImageUrl as string,
//       }),
//       { expiresIn: 60 }
//     );
//   }

//   const obj = data.toObject();
//   res.json({
//     ...obj,
//     bgImageKey: obj.bgImageUrl || "",
//     bgImageUrl: signed, // presigned URL for display
//   });
// };

// export const updateWhyChooseUs = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { bgImageKey, bgImageUrl, ...rest } = req.body as any;

//   const update: any = { ...rest };
//   const key = bgImageKey || bgImageUrl; // accept either name
//   if (key) update.bgImageUrl = key;     // store S3 key

//   const updated = await WhyChooseUs.findOneAndUpdate(
//     { userId, templateId },
//     { $set: update },
//     { new: true, upsert: true }
//   );
//   res.json({ message: "✅ Updated successfully", result: updated });
// };

// // --- upload bg image to S3 (multer-s3 sets req.file.key/bucket) ---
// export const uploadWhyChooseBg = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key;       // e.g., sections/whychoose/bg/...
//   const bucket: string = file.bucket;

//   const doc = await WhyChooseUs.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { bgImageUrl: key } },    // store the S3 key
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ Background uploaded", key, bucket, result: doc });
// };

// export const deleteWhyChooseBg = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const doc = await WhyChooseUs.findOne({ userId, templateId });
//   if (!doc || !doc.bgImageUrl) {
//     return res.status(404).json({ error: "No bg image to delete" });
//   }

//   try {
//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.bgImageUrl as string,
//       })
//     );
//   } catch { /* ignore delete failures */ }

//   doc.bgImageUrl = "";
//   await doc.save();
//   res.json({ message: "✅ Background deleted", result: doc });
// };





import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import WhyChooseUs from "../models/WhyChooseUs";

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

/** GET: return stored fields; bgImageUrl is already public http(s) URL */
export const getWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await WhyChooseUs.findOne({ userId, templateId });
    if (!doc) {
      return res.json({
        userId,
        templateId,
        title: "",
        description: "",
        stats: [],
        progressBars: [],
        bgOverlay: 0.5,
        bgImageUrl: "",
        bgImageKey: "", // legacy compat
      });
    }
    const obj = doc.toObject();
    return res.json({
      ...obj,
      bgImageUrl: obj.bgImageUrl || "",
      bgImageKey: "", // legacy compat (no S3)
    });
  } catch (err) {
    console.error("getWhyChooseUs error:", err);
    return res.status(500).json({ error: "Failed to fetch WhyChooseUs" });
  }
};

/** PUT: upsert text fields and/or bgImageUrl (must be public http(s) URL) */
export const updateWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    // Accept legacy names but only store a public URL
    const incomingUrl = String(
      body.bgImageUrl ?? body.bgImage ?? body.imageUrl ?? body.image ?? ""
    ).trim();

    // strip legacy fields from payload
    const {
      bgImageKey, // ignore legacy
      imageKey,   // ignore legacy
      image,      // consumed above
      ...rest
    } = body;

    const update: Record<string, any> = { ...rest };

    if (incomingUrl) {
      if (!/^https?:\/\//i.test(incomingUrl)) {
        return res.status(400).json({ error: "bgImageUrl must be a public http(s) URL" });
      }
      update.bgImageUrl = incomingUrl;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const updated = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: "✅ Updated successfully", result: updated });
  } catch (err) {
    console.error("updateWhyChooseUs error:", err);
    return res.status(500).json({ error: "Failed to update WhyChooseUs" });
  }
};

/** NEW: issue short-lived token + upload URL for cPanel (same as hero) */
export const getWhyChooseUploadToken = async (req: Request, res: Response) => {
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
    console.error("getWhyChooseUploadToken error:", e);
    return res.status(500).json({ error: "Failed to create upload token" });
  }
};

/** NEW: clear only the bg image URL */
export const clearWhyChooseBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: { bgImageUrl: "" } },
      { new: true }
    );
    return res.json({ message: "Background cleared", result: doc });
  } catch (err) {
    console.error("clearWhyChooseBg error:", err);
    return res.status(500).json({ error: "Failed to clear background image" });
  }
};
