



// controllers/topbar.controller.ts
import { Request, Response } from "express";
import Topbar from "../models/Topbar";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const presign = async (key?: string) => {
  if (!key) return "";
  if (key.startsWith("/uploads/")) return ""; // legacy local path
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn: 60 }
  );
};

export const getTopbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  try {
    const doc = await Topbar.findOne({ userId, templateId });
    if (!doc) return res.json({});

    const obj = doc.toObject();
    const logoKey = obj.logoUrl || "";
    const logoUrl = await presign(logoKey);

    return res.json({ ...obj, logoKey, logoUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch topbar" });
  }
};

/**
 * PUT /api/topbar/:userId/:templateId
 * Upserts everything that comes from the CMS form (text logo, sizes, contact, socials, etc.)
 * (If you POST a presigned URL into logoUrl it will expire—prefer sending a logoKey or use the upload endpoint.)
 */
export const updateTopbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const update = req.body;

  try {
    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { upsert: true, new: true }
    );
    return res.json({ message: "✅ Topbar updated", result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update topbar" });
  }
};

/**
 * POST /api/topbar/:userId/:templateId/logo
 * multipart/form-data field name: "logo"
 * Stores S3 key in Topbar.logoUrl and sets logoType="image"
 */
export const uploadLogo = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const { logoWidth, logoHeight } = req.body;
    const key: string = file.key;     // e.g. sections/topbar/....jpg

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

    return res.json({
      message: "✅ Logo uploaded",
      key,
      bucket: process.env.S3_BUCKET,
      result,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to upload logo" });
  }
};

/**
 * DELETE /api/topbar/:userId/:templateId/logo
 * Clears the image logo. Best-effort delete from S3 if it was there.
 */
export const deleteLogo = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  try {
    const doc = await Topbar.findOne({ userId, templateId });
    if (doc?.logoUrl && !doc.logoUrl.startsWith("/uploads/")) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: doc.logoUrl,
          })
        );
      } catch {
        // ignore delete errors
      }
    }

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: { logoUrl: "", logoType: "text" } },
      { new: true }
    );
    return res.json({ message: "✅ Logo removed", result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete logo" });
  }
};






// // controllers/topbar.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import Topbar from "../models/Topbar";

// dotenv.config();

// /** helper: get ids from params with safe defaults */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
// });

// /** helper: sign short-lived JWT for cPanel upload */
// function signUploadToken(payload: Record<string, any>) {
//   const now = Math.floor(Date.now() / 1000);
//   const exp = now + Number(process.env.TOKEN_TTL_SECONDS || 180);
//   return jwt.sign({ iat: now, exp, ...payload }, process.env.JWT_SECRET!, {
//     algorithm: "HS256",
//   });
// }

// /** GET: return topbar as stored; logoUrl is a public http(s) URL (if set) */
// export const getTopbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await Topbar.findOne({ userId, templateId });
//     if (!doc) {
//       return res.json({
//         userId,
//         templateId,
//         logoType: "text",
//         logoText: "",
//         logoUrl: "",
//         logoWidth: undefined,
//         logoHeight: undefined,
//         phone: "",
//         email: "",
//         socials: {},
//         logoKey: "", // legacy compat
//       });
//     }

//     const obj = doc.toObject();
//     return res.json({
//       ...obj,
//       logoUrl: obj.logoUrl || "",
//       logoKey: "", // legacy compat (no S3)
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to fetch topbar" });
//   }
// };

// /**
//  * PUT /api/topbar/:userId/:templateId
//  * Upserts fields from the CMS form.
//  * If a logo URL is provided, it MUST be a public http(s) URL.
//  */
// export const updateTopbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const body = (req.body || {}) as any;

//   try {
//     // Accept legacy/alias names; store only public URL
//     const incomingLogoUrl = String(body.logoUrl ?? body.logo ?? "").trim();
//     const removeLogo = body.removeLogo === true || body.removeLogo === "true";

//     const {
//       logoKey, // legacy (ignore)
//       logo,    // consumed above
//       removeLogo: _rm, // consumed above
//       ...rest
//     } = body;

//     const update: Record<string, any> = { ...rest };

//     if (incomingLogoUrl) {
//       if (!/^https?:\/\//i.test(incomingLogoUrl)) {
//         return res.status(400).json({ error: "logoUrl must be a public http(s) URL" });
//       }
//       update.logoUrl = incomingLogoUrl;
//       update.logoType = "image";
//     } else if (removeLogo) {
//       update.logoUrl = "";
//       update.logoType = "text";
//     }

//     const result = await Topbar.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { upsert: true, new: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Topbar updated", result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to update topbar" });
//   }
// };

// /** POST: short-lived token + upload URL for cPanel (same as hero) */
// export const getTopbarUploadToken = async (req: Request, res: Response) => {
//   try {
//     const { filename, size, type } = (req.body || {}) as any;
//     if (!filename || !size || !type) {
//       return res.status(400).json({ error: "filename, size, type required" });
//     }
//     const base = (process.env.CPANEL_BASE_URL || "").replace(/\/+$/, "");
//     if (!base) {
//       return res.status(500).json({ error: "CPANEL_BASE_URL not configured" });
//     }
//     const uploadUrl = `${base}/api/upload.php`;
//     const token = signUploadToken({ scope: "upload", filename, size, type });
//     return res.json({
//       token,
//       uploadUrl,
//       expiresIn: Number(process.env.TOKEN_TTL_SECONDS || 180),
//     });
//   } catch (e) {
//     console.error("getTopbarUploadToken error:", e);
//     return res.status(500).json({ error: "Failed to create upload token" });
//   }
// };

// /** POST: clear only the logo (sets logoType back to text) */
// export const clearLogo = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
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
