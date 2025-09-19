



// work with s3

import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";
import dotenv from "dotenv";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();


export const getAppointmentSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, templateId } = req.params;
    const doc: IAppointment | null = await Appointment.findOne({ userId, templateId });

    if (!doc) {
      res.status(200).json({
        userId,
        templateId,
        title: "",
        subtitle: "",
        officeAddress: "",
        officeTime: "",
        services: [],
        backgroundImage: "",
        backgroundImageUrl: "",
      });
      return;
    }

    let backgroundImageUrl = "";
    if (doc.backgroundImage) {
      backgroundImageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: doc.backgroundImage, // <-- stored S3 key
        }),
        { expiresIn: 60 }
      );
    }

    res.status(200).json({
      ...doc.toObject(),
      backgroundImageUrl, // <-- presigned URL for direct <img src=...>
    });
  } catch (error) {
    console.error("Error fetching appointment section:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/appointment/:userId/:templateId
 * - Upserts general fields from body (title/subtitle/etc.)
 * - If body includes imageKey or imageUrl, sets backgroundImage to that S3 key
 */
export const updateAppointmentSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, templateId } = req.params;
    const payload = { ...(req.body || {}) };

    // Allow both { imageKey } or { imageUrl } as synonyms for the S3 key
    const key = payload.imageKey || payload.imageUrl;
    if (key) {
      payload.backgroundImage = key;
      delete payload.imageKey;
      delete payload.imageUrl;
    }

    const updated: IAppointment = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: payload },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Updated", data: updated });
  } catch (error) {
    console.error("Error updating appointment section:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/appointment/upload-bg
 * - Uses multer-s3 (upload.single('image')) with folder forced to sections/appointment
 * - Stores S3 key in backgroundImage
 * - Returns the key and bucket
 */
export const uploadAppointmentBg = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const key: string = file.key;
    const bucket: string = file.bucket;

    // You can make userId/templateId dynamic later; keeping your simple pattern
    const userId = "demo-user";
    const templateId = "gym-template-1";

    await Appointment.findOneAndUpdate(
      { userId, templateId },
      { backgroundImage: key },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "✅ Appointment background uploaded",
      key,
      bucket,
    });
  } catch (error) {
    console.error("Upload Appointment BG error:", error);
    res.status(500).json({ error: "Failed to upload Appointment background" });
  }
};

/**
 * POST /api/appointment/clear-bg
 * - Clears the stored S3 key (does NOT delete from S3)
 */
export const clearAppointmentBg = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = "demo-user";
    const templateId = "gym-template-1";

    const result = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { backgroundImage: "" },
      { new: true }
    );

    res.status(200).json({ message: "Appointment background cleared", result });
  } catch (error) {
    console.error("Clear Appointment BG error:", error);
    res.status(500).json({ error: "Failed to clear Appointment background" });
  }
};






// cpanel
// // backend/controllers/appointment.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import Appointment, { IAppointment } from "../models/Appointment";

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

// /** GET: return stored fields + public backgroundImage URL (no S3) */
// export const getAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = ids(req);
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
//         backgroundImage: "",   // stored public URL
//         backgroundImageUrl: "",// alias for frontend convenience
//       });
//       return;
//     }

//     const obj = doc.toObject();
//     res.status(200).json({
//       ...obj,
//       backgroundImageUrl: obj.backgroundImage || "",
//     });
//   } catch (error) {
//     console.error("Error fetching appointment section:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /** PUT: upsert text fields and/or backgroundImage (must be public http(s) URL) */
// export const updateAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = ids(req);
//     const body = (req.body || {}) as any;

//     // Accept various field names from older UIs but only store a public URL
//     const incomingUrl = String(
//       body.backgroundImageUrl ?? body.backgroundImage ?? body.imageUrl ?? body.image ?? ""
//     ).trim();

//     // Remove any legacy S3 fields
//     const {
//       imageKey,          // ignore
//       backgroundKey,     // ignore
//       image,             // consumed above
//       backgroundImageUrl,// consumed above
//       ...rest
//     } = body;

//     const update: Record<string, any> = { ...rest };

//     if (incomingUrl) {
//       if (!/^https?:\/\//i.test(incomingUrl)) {
//         res.status(400).json({ error: "backgroundImage must be a public http(s) URL" });
//         return;
//       }
//       update.backgroundImage = incomingUrl;
//     }

//     if (!Object.keys(update).length) {
//       res.status(400).json({ error: "Nothing to update" });
//       return;
//     }

//     const updated = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { upsert: true, new: true, runValidators: true }
//     );

//     res.status(200).json({
//       message: "✅ Appointment saved",
//       data: updated,
//       backgroundImageUrl: updated.backgroundImage || "",
//     });
//   } catch (error) {
//     console.error("Error updating appointment section:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /** POST: short-lived token + upload URL for cPanel (same as hero) */
// export const getAppointmentUploadToken = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { filename, size, type } = (req.body || {}) as any;
//     if (!filename || !size || !type) {
//       res.status(400).json({ error: "filename, size, type required" });
//       return;
//     }
//     const base = (process.env.CPANEL_BASE_URL || "").replace(/\/+$/, "");
//     if (!base) {
//       res.status(500).json({ error: "CPANEL_BASE_URL not configured" });
//       return;
//     }
//     const uploadUrl = `${base}/api/upload.php`;
//     const token = signUploadToken({ scope: "upload", filename, size, type });
//     res.status(200).json({
//       token,
//       uploadUrl,
//       expiresIn: Number(process.env.TOKEN_TTL_SECONDS || 180),
//     });
//   } catch (error) {
//     console.error("getAppointmentUploadToken error:", error);
//     res.status(500).json({ error: "Failed to create upload token" });
//   }
// };

// /** POST: clear only the background image URL */
// export const clearAppointmentBg = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = ids(req);
//     const result = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { backgroundImage: "" } },
//       { new: true }
//     );
//     res.status(200).json({
//       message: "Appointment background cleared",
//       result,
//     });
//   } catch (error) {
//     console.error("Clear Appointment BG error:", error);
//     res.status(500).json({ error: "Failed to clear Appointment background" });
//   }
// };






