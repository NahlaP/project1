


// og
// import { Request, Response } from "express";
// import Service from "../models/Service";

// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// // helper to presign a single key
// const presign = async (key?: string) => {
//   if (!key) return "";
//   return getSignedUrl(
//     s3,
//     new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//     { expiresIn: 60 }
//   );
// };

// // GET all services (returns imageKey + short-lived imageUrl for each)
// export const getServices = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const doc = await Service.findOne({ userId, templateId });
//   if (!doc) return res.json({});

//   const obj = doc.toObject();
//   const services = await Promise.all(
//     (obj.services || []).map(async (s: any) => ({
//       ...s,
//       imageKey: s.imageUrl || "",
//       imageUrl: await presign(s.imageUrl),
//     }))
//   );

//   res.json({ ...obj, services });
// };

// // replace all services at once
// export const upsertServices = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { services = [] } = req.body as any;

//   // accept imageKey or imageUrl as the S3 key, store to imageUrl field
//   const normalized = services.map((s: any) => {
//     const key = s.imageKey || s.imageUrl || "";
//     const { imageKey, ...rest } = s;
//     return key ? { ...rest, imageUrl: key } : rest;
//   });

//   const updated = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { services: normalized } },
//     { new: true, upsert: true }
//   );

//   res.json({ message: "✅ Services updated", result: updated });
// };

// // add one service
// export const addService = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const s = req.body as any;
//   const key = s.imageKey || s.imageUrl || "";
//   const { imageKey, ...rest } = s;
//   const newService = key ? { ...rest, imageUrl: key } : rest;

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $push: { services: newService } },
//     { new: true, upsert: true }
//   );

//   res.json({ message: "✅ Service added", result: doc });
// };

// // update one by id
// export const updateService = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;
//   const u = req.body as any;

//   const set: any = {
//     "services.$.title": u.title,
//     "services.$.description": u.description,
//     "services.$.delay": u.delay,
//     "services.$.order": u.order,
//     "services.$.buttonText": u.buttonText,
//     "services.$.buttonHref": u.buttonHref,
//   };
//   const key = u.imageKey || u.imageUrl;
//   if (key) set["services.$.imageUrl"] = key; // store S3 key

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId, "services._id": serviceId },
//     { $set: set },
//     { new: true }
//   );

//   res.json({ message: "✅ Service updated", result: doc });
// };

// // delete a service
// export const deleteServiceById = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;

//   const doc = await Service.findOneAndUpdate(
//     { userId, templateId },
//     { $pull: { services: { _id: serviceId } } },
//     { new: true }
//   );

//   res.json({ message: "✅ Service deleted", result: doc });
// };

// // upload an image to S3 and attach it to a specific service
// export const uploadServiceImage = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key;       // S3 object key
//   const bucket: string = file.bucket;

//   // attach to the service if it exists
//   const updated = await Service.findOneAndUpdate(
//     { userId, templateId, "services._id": serviceId },
//     { $set: { "services.$.imageUrl": key } },
//     { new: true }
//   );

//   if (!updated) {
//     // no document or service yet — return the key so client can save later
//     return res.json({
//       message: "✅ Image uploaded (attach later with updateService/upsert)",
//       key,
//       bucket,
//     });
//   }

//   res.json({
//     message: "✅ Image uploaded & service updated",
//     key,
//     bucket,
//     result: updated,
//   });
// };

// // delete the service image from S3 and clear the field
// export const deleteServiceImage = async (req: Request, res: Response) => {
//   const { userId, templateId, serviceId } = req.params;

//   const doc = await Service.findOne({ userId, templateId });
//   if (!doc) return res.status(404).json({ error: "Document not found" });

//   const svc = (doc.services || []).find((s: any) => String(s._id) === serviceId);
//   if (!svc || !svc.imageUrl) {
//     return res.status(404).json({ error: "Service or image not found" });
//   }

//   try {
//     await s3.send(
//       new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: svc.imageUrl as string })
//     );
//   } catch {
//     // ignore delete failures; we still clear the DB
//   }

//   await Service.findOneAndUpdate(
//     { userId, templateId, "services._id": serviceId },
//     { $set: { "services.$.imageUrl": "" } },
//     { new: true }
//   );

//   res.json({ message: "✅ Image removed" });
// };









// import { Request, Response } from "express";
// import Service from "../models/Service";
// import dotenv from "dotenv";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
//   PutObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return "";
//   }
// }

// function cleanKeyCandidate(candidate?: string) {
//   let key = String(candidate ?? "");
//   if (!key) return "";
//   // strip accidental local paths
//   key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // ignore full URLs; we store S3 keys only
//   if (/^https?:\/\//i.test(key)) return "";
//   return key;
// }

// /* --------------- controllers --------------- */

// // GET all services (returns each with imageKey + presigned imageUrl)
// export const getServices = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await Service.findOne({ userId, templateId });
//     if (!doc) return res.json({ userId, templateId, services: [] });

//     const obj = doc.toObject();
//     const services = await Promise.all(
//       (obj.services || []).map(async (s: any) => ({
//         ...s,
//         imageKey: s.imageUrl || "",
//         imageUrl: await presignOrEmpty(s.imageUrl),
//       }))
//     );

//     return res.json({ ...obj, services });
//   } catch (e) {
//     console.error("getServices error:", e);
//     return res.status(500).json({ error: "Failed to fetch services" });
//   }
// };

// // Replace all services at once
// export const upsertServices = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { services = [] } = (req.body || {}) as any;

//     // Normalize each item: accept imageKey/imageUrl as S3 key → store in imageUrl
//     const normalized = (Array.isArray(services) ? services : []).map((s: any) => {
//       const key = cleanKeyCandidate(s.imageKey ?? s.imageUrl) || (s.imageUrl && !/^https?:\/\//i.test(s.imageUrl) ? s.imageUrl : "");
//       const { imageKey, ...rest } = s || {};
//       return key ? { ...rest, imageUrl: key } : { ...rest, imageUrl: rest?.imageUrl || "" };
//     });

//     const updated = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { services: normalized } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Services updated", result: updated });
//   } catch (e) {
//     console.error("upsertServices error:", e);
//     return res.status(500).json({ error: "Failed to upsert services" });
//   }
// };

// // Add one service
// export const addService = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const s = (req.body || {}) as any;

//     const key = cleanKeyCandidate(s.imageKey ?? s.imageUrl) || (s.imageUrl && !/^https?:\/\//i.test(s.imageUrl) ? s.imageUrl : "");
//     const { imageKey, ...rest } = s;
//     const newService = key ? { ...rest, imageUrl: key } : { ...rest, imageUrl: rest?.imageUrl || "" };

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $push: { services: newService } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Service added", result: doc });
//   } catch (e) {
//     console.error("addService error:", e);
//     return res.status(500).json({ error: "Failed to add service" });
//   }
// };

// // Update one by _id
// export const updateService = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params;
//     const u = (req.body || {}) as any;

//     const set: any = {};
//     if (u.title !== undefined) set["services.$.title"] = u.title;
//     if (u.description !== undefined) set["services.$.description"] = u.description;
//     if (u.delay !== undefined) set["services.$.delay"] = u.delay;
//     if (u.order !== undefined) set["services.$.order"] = u.order;
//     if (u.buttonText !== undefined) set["services.$.buttonText"] = u.buttonText;
//     if (u.buttonHref !== undefined) set["services.$.buttonHref"] = u.buttonHref;

//     const key = cleanKeyCandidate(u.imageKey ?? u.imageUrl) || (u.imageUrl && !/^https?:\/\//i.test(u.imageUrl) ? u.imageUrl : "");
//     if (key) set["services.$.imageUrl"] = key;

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: set },
//       { new: true }
//     );

//     return res.json({ message: "✅ Service updated", result: doc });
//   } catch (e) {
//     console.error("updateService error:", e);
//     return res.status(500).json({ error: "Failed to update service" });
//   }
// };

// // Delete a service
// export const deleteServiceById = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params;

//     const doc = await Service.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { services: { _id: serviceId } } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Service deleted", result: doc });
//   } catch (e) {
//     console.error("deleteServiceById error:", e);
//     return res.status(500).json({ error: "Failed to delete service" });
//   }
// };

// // Upload an image via multipart and attach to a specific service
// export const uploadServiceImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params;
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key;       // S3 object key
//     const bucket: string = file.bucket;

//     const updated = await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: { "services.$.imageUrl": key } },
//       { new: true }
//     );

//     if (!updated) {
//       // If service doesn’t exist yet, return key so client can attach later
//       return res.json({
//         message: "✅ Image uploaded (attach later with updateService/upsert)",
//         key, bucket,
//       });
//     }

//     return res.json({
//       message: "✅ Image uploaded & service updated",
//       key, bucket,
//       result: updated,
//     });
//   } catch (e) {
//     console.error("uploadServiceImage error:", e);
//     return res.status(500).json({ error: "Failed to upload service image" });
//   }
// };

// // OPTIONAL: Upload base64 image and attach it to a specific service
// export const uploadServiceImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params;
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/services/${serviceId || "misc"}/${Date.now()}-${baseName}${ext}`;

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(new PutObjectCommand({
//       Bucket: process.env.S3_BUCKET!,
//       Key: key,
//       Body: buf,
//       ContentType:
//         ext === ".png" ? "image/png" :
//         ext === ".webp" ? "image/webp" :
//         ext === ".gif" ? "image/gif" : "image/jpeg",
//       ACL: "private",
//     }));

//     // Attach to service if exists
//     const updated = await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: { "services.$.imageUrl": key } },
//       { new: true }
//     );

//     if (!updated) {
//       return res.json({
//         message: "✅ Image uploaded (attach later with updateService/upsert)",
//         key,
//       });
//     }

//     return res.json({
//       message: "✅ Image uploaded & service updated",
//       key,
//       result: updated,
//     });
//   } catch (e) {
//     console.error("uploadServiceImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload base64 service image" });
//   }
// };

// // Delete the service image from S3 and clear the field
// export const deleteServiceImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, serviceId } = req.params;

//     const doc = await Service.findOne({ userId, templateId });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const svc = (doc.services || []).find((s: any) => String(s._id) === serviceId);
//     if (!svc || !svc.imageUrl) {
//       return res.status(404).json({ error: "Service or image not found" });
//     }

//     try {
//       await s3.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: svc.imageUrl as string,
//         })
//       );
//     } catch {
//       // ignore S3 delete failures; still clear DB
//     }

//     await Service.findOneAndUpdate(
//       { userId, templateId, "services._id": serviceId },
//       { $set: { "services.$.imageUrl": "" } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Image removed" });
//   } catch (e) {
//     console.error("deleteServiceImage error:", e);
//     return res.status(500).json({ error: "Failed to delete service image" });
//   }
// };


































// C:\Users\97158\Desktop\project1\backend\controllers\service.controller.ts
import { Request, Response } from "express";
import Service from "../models/Service";
import dotenv from "dotenv";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TemplateModel } from "../models/Template";

dotenv.config();

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
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Presign failed for key:", key, e);
    return "";
  }
}

function cleanKeyCandidate(candidate?: string) {
  let key = String(candidate ?? "");
  if (!key) return "";
  // strip accidental local paths
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // ignore full URLs; we store S3 keys only
  if (/^https?:\/\//i.test(key)) return "";
  return key;
}

/** Normalize one service row coming from template content in any shape */
function normalizeTemplateRow(x: any, i: number) {
  const title =
    (typeof x?.title === "string" && x.title) ||
    (typeof x?.heading === "string" && x.heading) ||
    "";
  const description =
    (typeof x?.description === "string" && x.description) ||
    (typeof x?.desc === "string" && x.desc) ||
    "";
  const delay = typeof x?.delay === "string" ? x.delay : "";
  const order = Number.isFinite(x?.order) ? Number(x.order) : i;

  // If template provided absolute URL, we won't presign (use directly on the site)
  const imageKey =
    (typeof x?.imageKey === "string" &&
      !/^https?:\/\//i.test(x.imageKey) &&
      x.imageKey) ||
    (typeof x?.imageUrl === "string" &&
      !/^https?:\/\//i.test(x.imageUrl) &&
      x.imageUrl) ||
    "";
  const absUrl =
    (typeof x?.imageUrl === "string" &&
      /^https?:\/\//i.test(x.imageUrl) &&
      x.imageUrl) ||
    "";

  return { title, description, delay, order, imageKey, absUrl };
}

function normalizeTemplateArray(arr: any[]): any[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x, i) => normalizeTemplateRow(x, i))
    .filter((s) => s.title || s.description || s.imageKey || s.absUrl);
}

/* --------------- controllers --------------- */

// GET all services (returns each with imageKey + presigned/absolute imageUrl)
export const getServices = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const doc = await Service.findOne({ userId, templateId }).lean();
    if (doc && Array.isArray(doc.services) && doc.services.length) {
      const services = await Promise.all(
        doc.services.map(async (s: any) => ({
          ...s,
          imageKey: s.imageUrl || "",
          imageUrl: await presignOrEmpty(s.imageUrl), // presign S3 key
        }))
      );
      return res.json({ _source: "user", userId, templateId, services });
    }

    // 2) template fallback (type: "services" or "accordion")
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const sections = Array.isArray(tpl?.defaultSections)
      ? tpl.defaultSections
      : [];
    const fallback =
      sections
        .filter((s: any) => {
          const t = String(s?.type || "").toLowerCase();
          return t === "services" || t === "accordion";
        })
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (fallback) {
      const c = fallback.content || {};
      const rows =
        normalizeTemplateArray(c.items) ||
        normalizeTemplateArray(c.services) ||
        normalizeTemplateArray(Array.isArray(c) ? c : []);
      if (rows.length) {
        const services = await Promise.all(
          rows.map(async (r) => ({
            title: r.title,
            description: r.description,
            delay: r.delay,
            order: r.order,
            imageKey: r.imageKey || "",
            imageUrl: r.absUrl || (await presignOrEmpty(r.imageKey || "")),
          }))
        );
        return res.json({ _source: "template", userId, templateId, services });
      }
    }

    // 3) hard default (SIR accordion)
    const defaults = [
      {
        title: "The Power of Influencer Marketing",
        description:
          "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole.",
        delay: ".1s",
      },
      {
        title: "Unique and Influential Design",
        description:
          "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole.",
        delay: ".3s",
      },
      {
        title: "We Build and Activate Brands",
        description:
          "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole.",
        delay: ".5s",
      },
      {
        title: "Unique and Influential Design",
        description:
          "Taken possession of my entire soul, like these sweet mornings of spring which i enjoy with my whole.",
        delay: ".7s",
      },
    ].map((x, i) => ({ ...x, order: i, imageKey: "", imageUrl: "" }));

    return res.json({
      _source: "default",
      userId,
      templateId,
      services: defaults,
    });
  } catch (e) {
    console.error("getServices error:", e);
    return res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Replace all services at once
export const upsertServices = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { services = [] } = (req.body || {}) as any;

    // Normalize each item: accept imageKey/imageUrl as S3 key → store in imageUrl
    const normalized = (Array.isArray(services) ? services : []).map((s: any) => {
      const key =
        cleanKeyCandidate(s.imageKey ?? s.imageUrl) ||
        (s.imageUrl && !/^https?:\/\//i.test(s.imageUrl) ? s.imageUrl : "");
      const { imageKey, ...rest } = s || {};
      return key
        ? { ...rest, imageUrl: key }
        : { ...rest, imageUrl: rest?.imageUrl || "" };
    });

    const updated = await Service.findOneAndUpdate(
      { userId, templateId },
      { $set: { services: normalized } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Services updated", result: updated });
  } catch (e) {
    console.error("upsertServices error:", e);
    return res.status(500).json({ error: "Failed to upsert services" });
  }
};

// Add one service
export const addService = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const s = (req.body || {}) as any;

    const key =
      cleanKeyCandidate(s.imageKey ?? s.imageUrl) ||
      (s.imageUrl && !/^https?:\/\//i.test(s.imageUrl) ? s.imageUrl : "");
    const { imageKey, ...rest } = s;
    const newService = key
      ? { ...rest, imageUrl: key }
      : { ...rest, imageUrl: rest?.imageUrl || "" };

    const doc = await Service.findOneAndUpdate(
      { userId, templateId },
      { $push: { services: newService } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Service added", result: doc });
  } catch (e) {
    console.error("addService error:", e);
    return res.status(500).json({ error: "Failed to add service" });
  }
};

// Update one by _id
export const updateService = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, serviceId } = req.params;
    const u = (req.body || {}) as any;

    const set: any = {};
    if (u.title !== undefined) set["services.$.title"] = u.title;
    if (u.description !== undefined)
      set["services.$.description"] = u.description;
    if (u.delay !== undefined) set["services.$.delay"] = u.delay;
    if (u.order !== undefined) set["services.$.order"] = u.order;
    if (u.buttonText !== undefined) set["services.$.buttonText"] = u.buttonText;
    if (u.buttonHref !== undefined) set["services.$.buttonHref"] = u.buttonHref;

    const key =
      cleanKeyCandidate(u.imageKey ?? u.imageUrl) ||
      (u.imageUrl && !/^https?:\/\//i.test(u.imageUrl) ? u.imageUrl : "");
    if (key) set["services.$.imageUrl"] = key;

    const doc = await Service.findOneAndUpdate(
      { userId, templateId, "services._id": serviceId },
      { $set: set },
      { new: true }
    );

    return res.json({ message: "✅ Service updated", result: doc });
  } catch (e) {
    console.error("updateService error:", e);
    return res.status(500).json({ error: "Failed to update service" });
  }
};

// Delete a service
export const deleteServiceById = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, serviceId } = req.params;

    const doc = await Service.findOneAndUpdate(
      { userId, templateId },
      { $pull: { services: { _id: serviceId } } },
      { new: true }
    );

    return res.json({ message: "✅ Service deleted", result: doc });
  } catch (e) {
    console.error("deleteServiceById error:", e);
    return res.status(500).json({ error: "Failed to delete service" });
  }
};

// Upload an image via multipart and attach to a specific service
export const uploadServiceImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, serviceId } = req.params;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key; // S3 object key
    const bucket: string = file.bucket;

    const updated = await Service.findOneAndUpdate(
      { userId, templateId, "services._id": serviceId },
      { $set: { "services.$.imageUrl": key } },
      { new: true }
    );

    if (!updated) {
      return res.json({
        message: "✅ Image uploaded (attach later with updateService/upsert)",
        key,
        bucket,
      });
    }

    return res.json({
      message: "✅ Image uploaded & service updated",
      key,
      bucket,
      result: updated,
    });
  } catch (e) {
    console.error("uploadServiceImage error:", e);
    return res.status(500).json({ error: "Failed to upload service image" });
  }
};

// OPTIONAL: Upload base64 image and attach it to a specific service
export const uploadServiceImageBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, serviceId } = req.params;
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext =
      (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime =
        (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) ||
        "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/services/${serviceId || "misc"}/${Date.now()}-${baseName}${ext}`;

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(","))
        ? dataUrl.split(",")[1]
        : (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType:
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
            ? "image/gif"
            : "image/jpeg",
        ACL: "private",
      })
    );

    // Attach to service if exists
    const updated = await Service.findOneAndUpdate(
      { userId, templateId, "services._id": serviceId },
      { $set: { "services.$.imageUrl": key } },
      { new: true }
    );

    if (!updated) {
      return res.json({
        message: "✅ Image uploaded (attach later with updateService/upsert)",
        key,
      });
    }

    return res.json({
      message: "✅ Image uploaded & service updated",
      key,
      result: updated,
    });
  } catch (e) {
    console.error("uploadServiceImageBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload base64 service image" });
  }
};

// Delete the service image from S3 and clear the field
export const deleteServiceImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, serviceId } = req.params;

    const doc = await Service.findOne({ userId, templateId });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const svc = (doc.services || []).find(
      (s: any) => String(s._id) === serviceId
    );
    if (!svc || !svc.imageUrl) {
      return res.status(404).json({ error: "Service or image not found" });
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: svc.imageUrl as string,
        })
      );
    } catch {
      // ignore S3 delete failures; still clear DB
    }

    await Service.findOneAndUpdate(
      { userId, templateId, "services._id": serviceId },
      { $set: { "services.$.imageUrl": "" } },
      { new: true }
    );

    return res.json({ message: "✅ Image removed" });
  } catch (e) {
    console.error("deleteServiceImage error:", e);
    return res.status(500).json({ error: "Failed to delete service image" });
  }
};
