



// // controllers/topbar.controller.ts
// import { Request, Response } from "express";
// import Topbar from "../models/Topbar";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const presign = async (key?: string) => {
//   if (!key) return "";
//   if (key.startsWith("/uploads/")) return ""; // legacy local path
//   return getSignedUrl(
//     s3,
//     new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//     { expiresIn: 60 }
//   );
// };

// export const getTopbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   try {
//     const doc = await Topbar.findOne({ userId, templateId });
//     if (!doc) return res.json({});

//     const obj = doc.toObject();
//     const logoKey = obj.logoUrl || "";
//     const logoUrl = await presign(logoKey);

//     return res.json({ ...obj, logoKey, logoUrl });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to fetch topbar" });
//   }
// };

// /**
//  * PUT /api/topbar/:userId/:templateId
//  * Upserts everything that comes from the CMS form (text logo, sizes, contact, socials, etc.)
//  * (If you POST a presigned URL into logoUrl it will expire—prefer sending a logoKey or use the upload endpoint.)
//  */
// export const updateTopbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const update = req.body;

//   try {
//     const result = await Topbar.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { upsert: true, new: true }
//     );
//     return res.json({ message: "✅ Topbar updated", result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to update topbar" });
//   }
// };

// /**
//  * POST /api/topbar/:userId/:templateId/logo
//  * multipart/form-data field name: "logo"
//  * Stores S3 key in Topbar.logoUrl and sets logoType="image"
//  */
// export const uploadLogo = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   try {
//     const { logoWidth, logoHeight } = req.body;
//     const key: string = file.key;     // e.g. sections/topbar/....jpg

//     const result = await Topbar.findOneAndUpdate(
//       { userId, templateId },
//       {
//         $set: {
//           logoType: "image",
//           logoUrl: key, // store S3 key in DB
//           ...(logoWidth ? { logoWidth: Number(logoWidth) } : {}),
//           ...(logoHeight ? { logoHeight: Number(logoHeight) } : {}),
//         },
//       },
//       { upsert: true, new: true }
//     );

//     return res.json({
//       message: "✅ Logo uploaded",
//       key,
//       bucket: process.env.S3_BUCKET,
//       result,
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to upload logo" });
//   }
// };

// /**
//  * DELETE /api/topbar/:userId/:templateId/logo
//  * Clears the image logo. Best-effort delete from S3 if it was there.
//  */
// export const deleteLogo = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   try {
//     const doc = await Topbar.findOne({ userId, templateId });
//     if (doc?.logoUrl && !doc.logoUrl.startsWith("/uploads/")) {
//       try {
//         await s3.send(
//           new DeleteObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: doc.logoUrl,
//           })
//         );
//       } catch {
//         // ignore delete errors
//       }
//     }

//     const result = await Topbar.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { logoUrl: "", logoType: "text" } },
//       { new: true }
//     );
//     return res.json({ message: "✅ Logo removed", result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to delete logo" });
//   }
// };















// backend/controllers/topbar.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import Topbar from "../models/Topbar";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ---------------- helpers ---------------- */
const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

// Presign S3 key (or return absolute URL as-is)
async function presignOrEmpty(key?: string) {
  const v = String(key || "").trim();
  if (!v) return "";
  if (ABS.test(v)) return v;               // already an absolute URL (shouldn't be in DB, but be tolerant)
  if (v.startsWith("/uploads/")) return ""; // ignore legacy local
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: v }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("presign failed:", v, e);
    return "";
  }
}

// Clean a candidate image key (ignore full URLs; we store KEYS only)
function cleanKeyCandidate(candidate?: string) {
  let key = String(candidate ?? "");
  if (!key) return "";
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(key)) return ""; // don't store full/presigned URLs
  return key.replace(/^\/+/, "");
}

/* ---------------- controllers ---------------- */

/** GET /api/topbar/:userId/:templateId */
export const getTopbar = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await Topbar.findOne({ userId, templateId });

    if (!doc) {
      // return stable empty shape for the editor
      return res.json({
        userId,
        templateId,
        logoType: "text",
        logoText: "",
        logoUrl: "",     // presigned/absolute url for immediate use in UI
        logoKey: "",     // the stored S3 key (so UI can PUT it back if needed)
        logoWidth: undefined,
        logoHeight: undefined,
        phone: "",
        email: "",
        socials: [],
      });
    }

    const obj = doc.toObject();
    const logoKey = obj.logoUrl || ""; // DB stores the S3 key here
    const logoUrl = await presignOrEmpty(logoKey);

    return res.json({ ...obj, logoKey, logoUrl });
  } catch (e) {
    console.error("getTopbar error:", e);
    return res.status(500).json({ error: "Failed to fetch topbar" });
  }
};

/**
 * PUT /api/topbar/:userId/:templateId
 * Accepts normal fields + optional { logoKey | logoUrl } (both treated as S3 key).
 * DO NOT send presigned URLs here — they will be ignored by design.
 */
export const updateTopbar = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    // If a key was sent (logoKey or logoUrl), normalize into logoUrl field (DB stores the key there).
    const incomingKey = cleanKeyCandidate(body.logoKey ?? body.logoUrl);
    if (incomingKey) body.logoUrl = incomingKey;
    delete body.logoKey; // keep API clean

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: body },
      { upsert: true, new: true }
    );

    return res.json({ message: "✅ Topbar updated", result });
  } catch (e) {
    console.error("updateTopbar error:", e);
    return res.status(500).json({ error: "Failed to update topbar" });
  }
};

/**
 * POST /api/topbar/:userId/:templateId/logo
 * multipart/form-data field name: "logo"
 * Stores S3 key in Topbar.logoUrl and sets logoType="image".
 */
export const uploadLogo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const { logoWidth, logoHeight } = (req.body || {}) as any;
    const key: string = file.key; // e.g. sections/topbar/<timestamp>-name.png

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      {
        $set: {
          logoType: "image",
          logoUrl: key, // store S3 key in DB
          ...(logoWidth ? { logoWidth: Number(logoWidth) } : {}),
          ...(logoHeight ? { logoHeight: Number(logoHeight) } : {}),
        },
      },
      { upsert: true, new: true }
    );

    const signed = await presignOrEmpty(key);

    return res.json({
      message: "✅ Logo uploaded",
      key,
      bucket: process.env.S3_BUCKET,
      result: { ...result.toObject(), logoKey: key, logoUrl: signed },
    });
  } catch (e) {
    console.error("uploadLogo error:", e);
    return res.status(500).json({ error: "Failed to upload logo" });
  }
};

/**
 * POST /api/topbar/:userId/:templateId/logo-base64
 * JSON body: { dataUrl?, base64?, filename? , logoWidth?, logoHeight? }
 */
export const uploadLogoBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename, logoWidth, logoHeight } = (req.body || {}) as any;

    const safe = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safe.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else if (/svg/i.test(mime)) ext = ".svg";
      else ext = ".jpg";
    }
    const baseName = safe.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, "");

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const key = `sections/topbar/${userId}-${templateId}-${Date.now()}-${baseName}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: Buffer.from(b64, "base64"),
        ContentType:
          ext === ".png" ? "image/png" :
          ext === ".webp" ? "image/webp" :
          ext === ".gif" ? "image/gif" :
          ext === ".svg" ? "image/svg+xml" : "image/jpeg",
        ACL: "private",
      })
    );

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      {
        $set: {
          logoType: "image",
          logoUrl: key,
          ...(logoWidth ? { logoWidth: Number(logoWidth) } : {}),
          ...(logoHeight ? { logoHeight: Number(logoHeight) } : {}),
        },
      },
      { upsert: true, new: true }
    );

    const signed = await presignOrEmpty(key);

    return res.json({
      message: "✅ Logo uploaded (base64)",
      key,
      result: { ...result.toObject(), logoKey: key, logoUrl: signed },
    });
  } catch (e) {
    console.error("uploadLogoBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload base64 logo" });
  }
};

/**
 * DELETE /api/topbar/:userId/:templateId/logo
 * Clears the image logo. Best-effort delete from S3 if it was there.
 */
export const deleteLogo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await Topbar.findOne({ userId, templateId });

    if (doc?.logoUrl && !doc.logoUrl.startsWith("/uploads/") && !ABS.test(doc.logoUrl)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: doc.logoUrl,
          })
        );
      } catch {
        // ignore
      }
    }

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: { logoUrl: "", logoType: "text" } },
      { new: true }
    );
    return res.json({ message: "✅ Logo removed", result });
  } catch (e) {
    console.error("deleteLogo error:", e);
    return res.status(500).json({ error: "Failed to delete logo" });
  }
};
