



// // work with s3

// import { Request, Response } from "express";
// import Appointment, { IAppointment } from "../models/Appointment";
// import dotenv from "dotenv";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();


// export const getAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = req.params;
//     const doc: IAppointment | null = await Appointment.findOne({ userId, templateId });

//     if (!doc) {
//       res.status(200).json({
//         userId,
//         templateId,
//         title: "",
//         subtitle: "",
//         officeAddress: "",
//         officeTime: "",
//         services: [],
//         backgroundImage: "",
//         backgroundImageUrl: "",
//       });
//       return;
//     }

//     let backgroundImageUrl = "";
//     if (doc.backgroundImage) {
//       backgroundImageUrl = await getSignedUrl(
//         s3,
//         new GetObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: doc.backgroundImage, // <-- stored S3 key
//         }),
//         { expiresIn: 60 }
//       );
//     }

//     res.status(200).json({
//       ...doc.toObject(),
//       backgroundImageUrl, // <-- presigned URL for direct <img src=...>
//     });
//   } catch (error) {
//     console.error("Error fetching appointment section:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * PUT /api/appointment/:userId/:templateId
//  * - Upserts general fields from body (title/subtitle/etc.)
//  * - If body includes imageKey or imageUrl, sets backgroundImage to that S3 key
//  */
// export const updateAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = req.params;
//     const payload = { ...(req.body || {}) };

//     // Allow both { imageKey } or { imageUrl } as synonyms for the S3 key
//     const key = payload.imageKey || payload.imageUrl;
//     if (key) {
//       payload.backgroundImage = key;
//       delete payload.imageKey;
//       delete payload.imageUrl;
//     }

//     const updated: IAppointment = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: payload },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({ message: "Updated", data: updated });
//   } catch (error) {
//     console.error("Error updating appointment section:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * POST /api/appointment/upload-bg
//  * - Uses multer-s3 (upload.single('image')) with folder forced to sections/appointment
//  * - Stores S3 key in backgroundImage
//  * - Returns the key and bucket
//  */
// export const uploadAppointmentBg = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const file = (req as any).file;
//     if (!file) {
//       res.status(400).json({ error: "No image uploaded" });
//       return;
//     }

//     const key: string = file.key;
//     const bucket: string = file.bucket;

//     // You can make userId/templateId dynamic later; keeping your simple pattern
//     const userId = "demo-user";
//     const templateId = "gym-template-1";

//     await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { backgroundImage: key },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       message: "✅ Appointment background uploaded",
//       key,
//       bucket,
//     });
//   } catch (error) {
//     console.error("Upload Appointment BG error:", error);
//     res.status(500).json({ error: "Failed to upload Appointment background" });
//   }
// };

// /**
//  * POST /api/appointment/clear-bg
//  * - Clears the stored S3 key (does NOT delete from S3)
//  */
// export const clearAppointmentBg = async (_req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = "demo-user";
//     const templateId = "gym-template-1";

//     const result = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { backgroundImage: "" },
//       { new: true }
//     );

//     res.status(200).json({ message: "Appointment background cleared", result });
//   } catch (error) {
//     console.error("Clear Appointment BG error:", error);
//     res.status(500).json({ error: "Failed to clear Appointment background" });
//   }
// };




import { Request, Response } from "express";
import dotenv from "dotenv";
import Appointment, { IAppointment } from "../models/Appointment";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ------------ helpers ------------ */
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
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (/^https?:\/\//i.test(key)) return ""; // ignore full URLs here
  return key;
}

function normalizeServices(svcs: any): string[] | undefined {
  if (!svcs) return undefined;
  if (Array.isArray(svcs)) return svcs.map(String).filter(Boolean);
  if (typeof svcs === "string") {
    try {
      const parsed = JSON.parse(svcs);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return [svcs].filter(Boolean);
  }
  return undefined;
}

/* ------------ handlers ------------ */

/** GET /api/appointment/:userId/:templateId */
export const getAppointmentSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc: IAppointment | null = await Appointment.findOne({ userId, templateId });

    if (!doc) {
      return res.status(200).json({
        userId, templateId,
        title: "", subtitle: "",
        officeAddress: "", officeTime: "",
        services: [],
        backgroundImage: "",
        backgroundImageUrl: "",
      });
    }

    const backgroundImageUrl = await presignOrEmpty(doc.backgroundImage);

    return res.status(200).json({
      ...doc.toObject(),
      backgroundImageUrl, // presigned URL for <img src=...>
    });
  } catch (error) {
    console.error("Error fetching appointment section:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/** PUT /api/appointment/:userId/:templateId */
export const updateAppointmentSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const payload = { ...(req.body || {}) };

    // accept imageKey OR imageUrl (both treated as S3 key)
    const incomingKey = cleanKeyCandidate(payload.imageKey ?? payload.imageUrl);
    if (incomingKey) payload.backgroundImage = incomingKey;
    delete (payload as any).imageKey;
    delete (payload as any).imageUrl;

    // normalize services to string[]
    const services = normalizeServices(payload.services);
    if (services !== undefined) payload.services = services;

    const updated = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: payload },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "✅ Updated", data: updated });
  } catch (error) {
    console.error("Error updating appointment section:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/appointment/:userId/:templateId/image  (multipart form-data, key=image) */
export const uploadAppointmentBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No image uploaded" });

    const key: string = file.key;     // e.g. sections/appointment/<timestamp>-name.jpg
    const bucket: string = file.bucket;

    const doc = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: key } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "✅ Appointment background uploaded",
      key, bucket,
      imageKey: doc.backgroundImage || "",
    });
  } catch (error) {
    console.error("Upload Appointment BG error:", error);
    return res.status(500).json({ error: "Failed to upload Appointment background" });
  }
};

/** POST /api/appointment/:userId/:templateId/image-base64  (JSON) */
export const uploadAppointmentBgBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/appointment/${Date.now()}-${baseName}${ext}`;

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buf,
      ContentType:
        ext === ".png" ? "image/png" :
        ext === ".webp" ? "image/webp" :
        ext === ".gif" ? "image/gif" : "image/jpeg",
      ACL: "private",
    }));

    const doc = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: key } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "✅ Appointment background uploaded (base64)",
      key,
      imageKey: doc.backgroundImage || "",
    });
  } catch (error) {
    console.error("Upload Appointment BG (base64) error:", error);
    return res.status(500).json({ error: "Failed to upload Appointment background" });
  }
};

/** POST /api/appointment/:userId/:templateId/clear-image  (clears DB key; doesn't delete S3) */
export const clearAppointmentBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const result = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: "" } },
      { new: true }
    );
    return res.status(200).json({
      message: "Appointment background cleared",
      imageKey: result?.backgroundImage || "",
    });
  } catch (error) {
    console.error("Clear Appointment BG error:", error);
    return res.status(500).json({ error: "Failed to clear Appointment background" });
  }
};
