

// import { Request, Response } from "express";

// import Testimonial, { ITestimonial } from "../models/Testimonial";
// // GET all testimonials for a user/template
// export const getTestimonials = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const testimonials = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });
//     res.status(200).json(testimonials);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch testimonials" });
//   }
// };

// // POST new testimonial
// export const createTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const { name, profession, message, rating } = req.body;

//     let imageUrl = "";

//     // If using upload directly (via /api/testimonial/:userId/:templateId with multer)
//     if (req.file) {
//       imageUrl = `/uploads/testimonials/${req.file.filename}`;
//     } else if (req.body.imageUrl) {
//       // Fallback if image uploaded via /api/upload
//       imageUrl = req.body.imageUrl;
//     }

//     const newTestimonial = await Testimonial.create({
//       userId,
//       templateId,
//       name,
//       profession,
//       message,
//       rating,
//       imageUrl,
//     });

//     res.status(201).json(newTestimonial);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create testimonial" });
//   }
// };

// // DELETE testimonial
// export const deleteTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Testimonial.findByIdAndDelete(id);
//     if (!deleted) return res.status(404).json({ error: "Testimonial not found" });

//     res.status(200).json({ message: "Testimonial deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete testimonial" });
//   }
// };

// // controllers/testimonial.controller.ts
// export const updateTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, profession, message, rating, imageUrl, removeImage } = req.body;

//     const testimonial = await Testimonial.findById(id);
//     if (!testimonial) return res.status(404).json({ error: "Testimonial not found" });

//     // Update fields if present
//     if (name) testimonial.name = name;
//     if (profession) testimonial.profession = profession;
//     if (message) testimonial.message = message;
//     if (rating !== undefined) testimonial.rating = Number(rating);

//     // Handle image upload
//     if (req.file) {
//       testimonial.imageUrl = `/uploads/testimonials/${req.file.filename}`;
//     } else if (imageUrl) {
//       testimonial.imageUrl = imageUrl;
//     } else if (removeImage === "true") {
//       testimonial.imageUrl = undefined;
//     }

//     const updated = await testimonial.save();
//     res.status(200).json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update testimonial" });
//   }
// };





import { Request, Response } from "express";
import Testimonial from "../models/Testimonial";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const presign = async (key?: string) => {
  if (!key) return "";
  if (typeof key === "string" && key.startsWith("/uploads/")) return ""; // legacy
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn: 60 }
  );
};

// GET all testimonials for a user/template
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });

    const withUrls = await Promise.all(
      rows.map(async (t) => {
        const obj = t.toObject();
        return {
          ...obj,
          imageKey: obj.imageUrl || "",
          imageUrl: await presign(obj.imageUrl),
        };
      })
    );

    res.status(200).json(withUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// CREATE testimonial (accepts file upload or imageKey)
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const { name, profession, message, rating, imageKey } = req.body as any;

    const file = (req as any).file;
    const key = file?.key || imageKey || "";  // <-- S3 key

    const row = await Testimonial.create({
      userId,
      templateId,
      name,
      profession,
      message,
      rating: rating !== undefined ? Number(rating) : undefined,
      imageUrl: key,                           // store S3 key in DB
    });

    res.status(201).json({
      message: "✅ Testimonial created",
      data: {
        ...row.toObject(),
        imageKey: key,
        imageUrl: key ? await presign(key) : "",
      },
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: Object.fromEntries(
          Object.entries(err.errors || {}).map(([k, v]: any) => [k, v.message])
        ),
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// UPDATE testimonial (fields + optional new image or imageKey)
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, profession, message, rating, imageKey, removeImage } = req.body as any;

    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (name) row.name = name;
    if (profession) row.profession = profession;
    if (message) row.message = message;
    if (rating !== undefined) row.rating = Number(rating);

    const file = (req as any).file;
    if (file?.key) {
      row.imageUrl = file.key;          // new S3 key
    } else if (imageKey) {
      row.imageUrl = imageKey;          // set via key
    } else if (removeImage === "true" || removeImage === true) {
      // best-effort delete from S3 if it was there
      if (row.imageUrl && !row.imageUrl.startsWith("/uploads/")) {
        try {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: row.imageUrl as string,
          }));
        } catch {}
      }
      row.imageUrl = "";
    }

    const updated = await row.save();
    res.status(200).json({
      message: "✅ Testimonial updated",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: await presign(updated.imageUrl),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// DELETE testimonial (+ best-effort delete image from S3)
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (row.imageUrl && !row.imageUrl.startsWith("/uploads/")) {
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: row.imageUrl as string,
        }));
      } catch {}
    }

    await Testimonial.findByIdAndDelete(id);
    res.status(200).json({ message: "✅ Testimonial deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};
