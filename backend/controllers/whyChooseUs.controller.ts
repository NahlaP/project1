
// import { Request, Response } from "express";
// import path from "path";
// import fs from "fs";
// import WhyChooseUs from "../models/WhyChooseUs";

// export const getWhyChooseUs = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const data = await WhyChooseUs.findOne({ userId, templateId });
//   res.json(data || {});
// };

// export const updateWhyChooseUs = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const body = req.body;
//   const updated = await WhyChooseUs.findOneAndUpdate(
//     { userId, templateId },
//     { $set: body },
//     { new: true, upsert: true }
//   );
//   res.json({ message: "✅ Updated successfully", result: updated });
// };

// // ---------- NEW: upload bg image ----------
// export const uploadWhyChooseBg = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const imageUrl = `/uploads/whychoose/${req.file.filename}`;

//   const doc = await WhyChooseUs.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { bgImageUrl: imageUrl } },
//     { upsert: true, new: true }
//   );

//   return res.json({ message: "✅ Background uploaded", result: doc });
// };

// // ---------- NEW: delete bg image ----------
// export const deleteWhyChooseBg = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await WhyChooseUs.findOne({ userId, templateId });
//   if (!doc || !doc.bgImageUrl) {
//     return res.status(404).json({ error: "No bg image to delete" });
//   }

//   const absolute = path.join(
//     process.cwd(),
//     "uploads",
//     doc.bgImageUrl.replace("/uploads/", "")
//   );
//   if (fs.existsSync(absolute)) {
//     fs.unlinkSync(absolute);
//   }

//   doc.bgImageUrl = "";
//   await doc.save();

//   return res.json({ message: "✅ Background deleted", result: doc });
// };

// // og
import { Request, Response } from "express";
import WhyChooseUs from "../models/WhyChooseUs";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getWhyChooseUs = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const data = await WhyChooseUs.findOne({ userId, templateId });
  if (!data) return res.json({});

  let signed = "";
  if (data.bgImageUrl) {
    signed = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: data.bgImageUrl as string,
      }),
      { expiresIn: 60 }
    );
  }

  const obj = data.toObject();
  res.json({
    ...obj,
    bgImageKey: obj.bgImageUrl || "",
    bgImageUrl: signed, // presigned URL for display
  });
};

export const updateWhyChooseUs = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { bgImageKey, bgImageUrl, ...rest } = req.body as any;

  const update: any = { ...rest };
  const key = bgImageKey || bgImageUrl; // accept either name
  if (key) update.bgImageUrl = key;     // store S3 key

  const updated = await WhyChooseUs.findOneAndUpdate(
    { userId, templateId },
    { $set: update },
    { new: true, upsert: true }
  );
  res.json({ message: "✅ Updated successfully", result: updated });
};

// --- upload bg image to S3 (multer-s3 sets req.file.key/bucket) ---
export const uploadWhyChooseBg = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key;       // e.g., sections/whychoose/bg/...
  const bucket: string = file.bucket;

  const doc = await WhyChooseUs.findOneAndUpdate(
    { userId, templateId },
    { $set: { bgImageUrl: key } },    // store the S3 key
    { upsert: true, new: true }
  );

  res.json({ message: "✅ Background uploaded", key, bucket, result: doc });
};

export const deleteWhyChooseBg = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
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
  } catch { /* ignore delete failures */ }

  doc.bgImageUrl = "";
  await doc.save();
  res.json({ message: "✅ Background deleted", result: doc });
};





