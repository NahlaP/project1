// // backend/controllers/about.controller.ts
// import { Request, Response } from "express";
// import fs from "fs";
// import path from "path";
// import About from "../models/About";

// export const getAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const doc = await About.findOne({ userId, templateId });
//   res.json(doc || {});
// };

// export const upsertAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const payload = req.body;

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     { $set: payload },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ About saved", result: doc });
// };

// // -------- image upload helpers --------
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const imageUrl = `/uploads/about/${req.file.filename}`;

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     {
//       $set: {
//         imageUrl,
//       },
//     },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ Image uploaded", result: doc });
// };

// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await About.findOne({ userId, templateId });
//   if (!doc || !doc.imageUrl) {
//     return res.status(404).json({ error: "No image set" });
//   }

//   const absolute = path.join(process.cwd(), "uploads", doc.imageUrl.replace("/uploads/", ""));
//   if (fs.existsSync(absolute)) {
//     fs.unlinkSync(absolute);
//   }

//   doc.imageUrl = "";
//   await doc.save();

//   res.json({ message: "✅ Image removed", result: doc });
// };



// backend/controllers/about.controller.ts
import { Request, Response } from "express";
import About from "../models/About";

import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getAbout = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  const doc = await About.findOne({ userId, templateId });
  if (!doc) return res.json({});

  let signedUrl = "";
  if (doc.imageUrl) {
    signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: doc.imageUrl as string, // S3 object key stored in DB
      }),
      { expiresIn: 60 }
    );
  }

  // Return raw key + a viewable URL
  const obj = doc.toObject();
  return res.json({
    ...obj,
    imageKey: obj.imageUrl || "",
    imageUrl: signedUrl,
  });
};

export const upsertAbout = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { imageKey, imageUrl, ...rest } = req.body as any;

  const update: any = { ...rest };
  const key = imageKey || imageUrl;
  if (key) update.imageUrl = key; // store S3 key

  const doc = await About.findOneAndUpdate(
    { userId, templateId },
    { $set: update },
    { upsert: true, new: true }
  );

  res.json({ message: "✅ About saved", result: doc });
};

// -------- image upload helpers (multer-s3 sets req.file.key) --------
export const uploadAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key;       // e.g. sections/about/....
  const bucket: string = file.bucket; // project1-uploads-12345

  const doc = await About.findOneAndUpdate(
    { userId, templateId },
    { $set: { imageUrl: key } },      // store S3 key
    { upsert: true, new: true }
  );

  res.json({ message: "✅ Image uploaded", key, bucket, result: doc });
};

export const deleteAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  const doc = await About.findOne({ userId, templateId });
  if (!doc || !doc.imageUrl) {
    return res.status(404).json({ error: "No image set" });
  }

  // try to delete the object in S3 (optional but cleaner)
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: doc.imageUrl as string,
      })
    );
  } catch {
    // ignore delete failures; we still clear the DB
  }

  doc.imageUrl = "";
  await doc.save();

  res.json({ message: "✅ Image removed", result: doc });
};
