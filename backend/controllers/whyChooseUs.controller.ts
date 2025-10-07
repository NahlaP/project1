

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
import WhyChooseUs from "../models/WhyChooseUs";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
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
  // strip any accidental local upload folder
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // if a full URL was sent, ignore (we store keys only)
  if (/^https?:\/\//i.test(key)) return "";
  return key;
}

/* ---------------- handlers ---------------- */

// GET: fetch doc + return presigned bg image URL
export const getWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const data = await WhyChooseUs.findOne({ userId, templateId });

    if (!data) {
      return res.json({
        userId,
        templateId,
        description: "",
        stats: [],
        progressBars: [],
        bgImageKey: "",
        bgImageUrl: "",
        bgImageAlt: "",
      });
    }

    const obj = data.toObject();
    const bgImageKey = obj.bgImageUrl || "";
    const bgImageUrl = await presignOrEmpty(bgImageKey);

    return res.json({
      ...obj,
      bgImageKey,
      bgImageUrl,
    });
  } catch (e) {
    console.error("getWhyChooseUs error:", e);
    return res.status(500).json({ error: "Failed to fetch WhyChooseUs" });
  }
};

// PUT: upsert fields; accept bgImageKey or bgImageUrl as the S3 key
export const updateWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { bgImageKey, bgImageUrl, ...rest } = (req.body || {}) as any;

    const update: any = { ...rest };
    const key = cleanKeyCandidate(bgImageKey ?? bgImageUrl);
    if (key) update.bgImageUrl = key; // store the S3 key in bgImageUrl

    const updated = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Updated successfully", result: updated });
  } catch (e) {
    console.error("updateWhyChooseUs error:", e);
    return res.status(500).json({ error: "Failed to update WhyChooseUs" });
  }
};

// POST (multipart): upload bg image (multer-s3), store S3 key, return presigned
export const uploadWhyChooseBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key;       // e.g., sections/whychoose/bg/...
    const bucket: string = file.bucket;

    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: { bgImageUrl: key } },    // store the S3 key
      { upsert: true, new: true }
    );

    const url = await presignOrEmpty(key);

    return res.json({
      message: "✅ Background uploaded",
      key,
      bucket,
      result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
    });
  } catch (e) {
    console.error("uploadWhyChooseBg error:", e);
    return res.status(500).json({ error: "Failed to upload background" });
  }
};

// POST (JSON): base64 upload (no multipart), infer extension safely
export const uploadWhyChooseBgBase64 = async (req: Request, res: Response) => {
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
    const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const key = `sections/whychoose/bg/${userId}-${templateId}-${Date.now()}-${base}${ext}`;
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

    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: { bgImageUrl: key } },
      { upsert: true, new: true }
    );

    const url = await presignOrEmpty(key);

    return res.json({
      message: "✅ Background uploaded (base64)",
      key,
      result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
    });
  } catch (e) {
    console.error("uploadWhyChooseBgBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload background (base64)" });
  }
};

// DELETE: best-effort S3 delete + clear field
export const deleteWhyChooseBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await WhyChooseUs.findOne({ userId, templateId });
    if (!doc || !doc.bgImageUrl) {
      return res.status(404).json({ error: "No bg image to delete" });
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: doc.bgImageUrl as string,
        })
      );
    } catch {
      // ignore delete failures; still clear DB
    }

    doc.bgImageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Background deleted", result: doc });
  } catch (e) {
    console.error("deleteWhyChooseBg error:", e);
    return res.status(500).json({ error: "Failed to delete background" });
  }
};
