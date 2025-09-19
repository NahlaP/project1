



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





// // cpanel
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import Service from "../models/Service";

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

// /** GET all services — return exactly what’s stored; no S3/presign */
// export const getServices = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await Service.findOne({ userId, templateId });
//     if (!doc) return res.json({ userId, templateId, services: [] });

//     const obj = doc.toObject();
//     // Optional legacy compatibility: expose imageKey as "" to avoid older UI expecting it
//     const services = (obj.services || []).map((s: any) => ({
//       ...s,
//       imageKey: "",                 // legacy (was S3 key)
//       imageUrl: s.imageUrl || "",   // public URL we now store
//     }));

//     return res.json({ ...obj, services });
//   } catch (err) {
//     console.error("getServices error:", err);
//     return res.status(500).json({ error: "Failed to fetch services" });
//   }
// };

// /** Replace all services at once (imageUrl must be public http(s) URL if provided) */
// export const upsertServices = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { services = [] } = (req.body || {}) as any;

//     const normalized = (services as any[]).map((s) => {
//       const {
//         imageKey,         // ignore legacy
//         image,            // alias
//         imageUrl,         // preferred
//         ...rest
//       } = s || {};

//       const url = String(imageUrl ?? image ?? "").trim();
//       if (url && !/^https?:\/\//i.test(url)) {
//         throw new Error("imageUrl must be a public http(s) URL");
//       }
//       return url ? { ...rest, imageUrl: url } : { ...rest, imageUrl: "" };
//     });

//     const updated = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { services: normalized } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Services updated", result: updated });
//   } catch (err: any) {
//     if (err?.message?.includes("imageUrl")) {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("upsertServices error:", err);
//     return res.status(500).json({ error: "Failed to update services" });
//   }
// };

// /** Add one service */
// export const addService = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const payload = (req.body || {}) as any;

//     const {
//       imageKey,   // legacy
//       image,      // alias
//       imageUrl,   // preferred
//       ...rest
//     } = payload;

//     const url = String(imageUrl ?? image ?? "").trim();
//     if (url && !/^https?:\/\//i.test(url)) {
//       return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//     }

//     const newService = url ? { ...rest, imageUrl: url } : { ...rest, imageUrl: "" };

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $push: { services: newService } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Service added", result: doc });
//   } catch (err) {
//     console.error("addService error:", err);
//     return res.status(500).json({ error: "Failed to add service" });
//   }
// };

// /** Update one service by id */
// export const updateService = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params as any;
//     const u = (req.body || {}) as any;

//     const set: Record<string, any> = {};
//     if ("title" in u)        set["services.$.title"] = u.title;
//     if ("description" in u)  set["services.$.description"] = u.description;
//     if ("delay" in u)        set["services.$.delay"] = u.delay;
//     if ("order" in u)        set["services.$.order"] = u.order;
//     if ("buttonText" in u)   set["services.$.buttonText"] = u.buttonText;
//     if ("buttonHref" in u)   set["services.$.buttonHref"] = u.buttonHref;

//     // image handling (public URL only)
//     const incomingUrl = String(u.imageUrl ?? u.image ?? "").trim();
//     if (incomingUrl) {
//       if (!/^https?:\/\//i.test(incomingUrl)) {
//         return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//       }
//       set["services.$.imageUrl"] = incomingUrl;
//     }

//     if (!Object.keys(set).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: set },
//       { new: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Service updated", result: doc });
//   } catch (err) {
//     console.error("updateService error:", err);
//     return res.status(500).json({ error: "Failed to update service" });
//   }
// };

// /** Delete a service */
// export const deleteServiceById = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params as any;

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { services: { _id: serviceId } } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Service deleted", result: doc });
//   } catch (err) {
//     console.error("deleteServiceById error:", err);
//     return res.status(500).json({ error: "Failed to delete service" });
//   }
// };

// /** NEW: clear image for a specific service */
// export const clearServiceImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params as any;

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: { "services.$.imageUrl": "" } },
//       { new: true }
//     );

//     return res.json({ message: "Image cleared", result: doc });
//   } catch (err) {
//     console.error("clearServiceImage error:", err);
//     return res.status(500).json({ error: "Failed to clear service image" });
//   }
// };

// /** NEW: issue short-lived token + upload URL for cPanel (same flow as hero) */
// export const getServiceUploadToken = async (req: Request, res: Response) => {
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
//     console.error("getServiceUploadToken error:", e);
//     return res.status(500).json({ error: "Failed to create upload token" });
//   }
// };
