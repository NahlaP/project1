// import { Request, Response } from "express";
// import fs from "fs";
// import path from "path";
// import Service from "../models/Service";

// // Get all services
// export const getServices = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const doc = await Service.findOne({ userId, templateId });
//   res.json(doc || {});
// };

// // Bulk replace all services
// export const upsertServices = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { services } = req.body;

//   const updated = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { services } },
//     { new: true, upsert: true }
//   );

//   res.json({ message: "✅ Services updated", result: updated });
// };

// // Add a single service
// export const addService = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const newService = req.body;

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $push: { services: newService } },
//     { new: true, upsert: true }
//   );

//   res.json({ message: "✅ Service added", result: doc });
// };

// // Update a single service by ID
// export const updateService = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;
//   const update = req.body;

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId, "services._id": serviceId },
//     {
//       $set: {
//         "services.$.title": update.title,
//         "services.$.description": update.description,
//         "services.$.imageUrl": update.imageUrl,
//         "services.$.delay": update.delay,
//         "services.$.order": update.order,
//         "services.$.buttonText": update.buttonText,
//         "services.$.buttonHref": update.buttonHref,
//       },
//     },
//     { new: true }
//   );

//   res.json({ message: "✅ Service updated", result: doc });
// };

// // Delete a service by ID
// export const deleteServiceById = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $pull: { services: { _id: serviceId } } },
//     { new: true }
//   );

//   res.json({ message: "✅ Service deleted", result: doc });
// };

// // Upload image and attach to service
// export const uploadServiceImage = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;

//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   const imageUrl = `/uploads/services/${req.file.filename}`;
//   const doc = await Service.findOne({ userId, templateId });

//   if (!doc) {
//     return res.json({ message: "✅ Image uploaded (no service doc)", imageUrl });
//   }

//   const service = doc.services.find((s) => String(s._id) === serviceId);
//   if (service) {
//     service.imageUrl = imageUrl;
//     await doc.save();
//     return res.json({ message: "✅ Image uploaded & service updated", result: doc });
//   }

//   res.json({ message: "✅ Image uploaded", imageUrl });
// };

// // Delete image from disk and service
// export const deleteServiceImage = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;

//   const doc = await Service.findOne({ userId, templateId });
//   if (!doc) return res.status(404).json({ error: "Document not found" });

//   const service = doc.services.find((s) => String(s._id) === serviceId);
//   if (!service || !service.imageUrl) {
//     return res.status(404).json({ error: "Service or image not found" });
//   }

//   const absolute = path.join(
//     process.cwd(),
//     "uploads",
//     service.imageUrl.replace("/uploads/", "")
//   );

//   if (fs.existsSync(absolute)) fs.unlinkSync(absolute);

//   service.imageUrl = "";
//   await doc.save();

//   res.json({ message: "✅ Image removed", result: doc });
// };




import { Request, Response } from "express";
import Service from "../models/Service";

import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// helper to presign a single key
const presign = async (key?: string) => {
  if (!key) return "";
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn: 60 }
  );
};

// GET all services (returns imageKey + short-lived imageUrl for each)
export const getServices = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const doc = await Service.findOne({ userId, templateId });
  if (!doc) return res.json({});

  const obj = doc.toObject();
  const services = await Promise.all(
    (obj.services || []).map(async (s: any) => ({
      ...s,
      imageKey: s.imageUrl || "",
      imageUrl: await presign(s.imageUrl),
    }))
  );

  res.json({ ...obj, services });
};

// replace all services at once
export const upsertServices = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { services = [] } = req.body as any;

  // accept imageKey or imageUrl as the S3 key, store to imageUrl field
  const normalized = services.map((s: any) => {
    const key = s.imageKey || s.imageUrl || "";
    const { imageKey, ...rest } = s;
    return key ? { ...rest, imageUrl: key } : rest;
  });

  const updated = await Service.findOneAndUpdate(
    { userId, templateId },
    { $set: { services: normalized } },
    { new: true, upsert: true }
  );

  res.json({ message: "✅ Services updated", result: updated });
};

// add one service
export const addService = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const s = req.body as any;
  const key = s.imageKey || s.imageUrl || "";
  const { imageKey, ...rest } = s;
  const newService = key ? { ...rest, imageUrl: key } : rest;

  const doc = await Service.findOneAndUpdate(
    { userId, templateId },
    { $push: { services: newService } },
    { new: true, upsert: true }
  );

  res.json({ message: "✅ Service added", result: doc });
};

// update one by id
export const updateService = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;
  const u = req.body as any;

  const set: any = {
    "services.$.title": u.title,
    "services.$.description": u.description,
    "services.$.delay": u.delay,
    "services.$.order": u.order,
    "services.$.buttonText": u.buttonText,
    "services.$.buttonHref": u.buttonHref,
  };
  const key = u.imageKey || u.imageUrl;
  if (key) set["services.$.imageUrl"] = key; // store S3 key

  const doc = await Service.findOneAndUpdate(
    { userId, templateId, "services._id": serviceId },
    { $set: set },
    { new: true }
  );

  res.json({ message: "✅ Service updated", result: doc });
};

// delete a service
export const deleteServiceById = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;

  const doc = await Service.findOneAndUpdate(
    { userId, templateId },
    { $pull: { services: { _id: serviceId } } },
    { new: true }
  );

  res.json({ message: "✅ Service deleted", result: doc });
};

// upload an image to S3 and attach it to a specific service
export const uploadServiceImage = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key;       // S3 object key
  const bucket: string = file.bucket;

  // attach to the service if it exists
  const updated = await Service.findOneAndUpdate(
    { userId, templateId, "services._id": serviceId },
    { $set: { "services.$.imageUrl": key } },
    { new: true }
  );

  if (!updated) {
    // no document or service yet — return the key so client can save later
    return res.json({
      message: "✅ Image uploaded (attach later with updateService/upsert)",
      key,
      bucket,
    });
  }

  res.json({
    message: "✅ Image uploaded & service updated",
    key,
    bucket,
    result: updated,
  });
};

// delete the service image from S3 and clear the field
export const deleteServiceImage = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;

  const doc = await Service.findOne({ userId, templateId });
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const svc = (doc.services || []).find((s: any) => String(s._id) === serviceId);
  if (!svc || !svc.imageUrl) {
    return res.status(404).json({ error: "Service or image not found" });
  }

  try {
    await s3.send(
      new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: svc.imageUrl as string })
    );
  } catch {
    // ignore delete failures; we still clear the DB
  }

  await Service.findOneAndUpdate(
    { userId, templateId, "services._id": serviceId },
    { $set: { "services.$.imageUrl": "" } },
    { new: true }
  );

  res.json({ message: "✅ Image removed" });
};
