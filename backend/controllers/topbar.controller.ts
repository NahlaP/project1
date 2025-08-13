
// import { Request, Response } from "express";
// import Topbar from "../models/Topbar";

// export const getTopbar = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   try {
//     const data = await Topbar.findOne({ userId, templateId });
//     return res.json(data || {});
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to fetch topbar" });
//   }
// };

// /**
//  * PUT /api/topbar/:userId/:templateId
//  * Upserts everything that comes from the CMS form (text logo, image props, contact, socials, etc.)
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
//  * Expects multipart/form-data with field name "logo"
//  * Will set logoType to "image" and store the (public) path in logoUrl
//  */
// export const uploadLogo = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   try {
//     const publicPath = `/uploads/topbar/${req.file.filename}`; // what the front-end will use
//     const { logoWidth, logoHeight } = req.body;

//     const result = await Topbar.findOneAndUpdate(
//       { userId, templateId },
//       {
//         $set: {
//           logoType: "image",
//           logoUrl: publicPath,
//           ...(logoWidth ? { logoWidth: Number(logoWidth) } : {}),
//           ...(logoHeight ? { logoHeight: Number(logoHeight) } : {}),
//         },
//       },
//       { upsert: true, new: true }
//     );

//     return res.json({ message: "✅ Logo uploaded", result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: "Failed to upload logo" });
//   }
// };

// /**
//  * DELETE /api/topbar/:userId/:templateId/logo
//  * Clears the image logo (does not delete the file from disk by default)
//  */
// export const deleteLogo = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

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
