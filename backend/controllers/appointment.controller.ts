// import { Request, Response } from "express";
// import Appointment, { IAppointment } from "../models/Appointment";

// // GET /api/appointment/:userId/:templateId
// export const getAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = req.params;
//     const data: IAppointment | null = await Appointment.findOne({ userId, templateId });
//     res.status(200).json(data || {});
//   } catch (error) {
//     console.error("Error fetching appointment section:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // PUT /api/appointment/:userId/:templateId
// export const updateAppointmentSection = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, templateId } = req.params;
//     const payload = req.body;

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






import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";
import dotenv from "dotenv";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/**
 * GET /api/appointment/:userId/:templateId
 * - Returns appointment document
 * - Adds backgroundImageUrl (presigned) if backgroundImage (S3 key) is present
 */
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
