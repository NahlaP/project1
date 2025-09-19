



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







// // cpanel
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import Testimonial from "../models/Testimonial";

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

// /** GET all testimonials (return stored public URLs as-is) */
// export const getTestimonials = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });

//     const out = rows.map((t) => {
//       const obj = t.toObject();
//       return {
//         ...obj,
//         imageKey: "",                 // legacy (no S3 key)
//         imageUrl: obj.imageUrl || "", // public URL stored
//       };
//     });

//     res.status(200).json(out);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch testimonials" });
//   }
// };

// /** CREATE testimonial (imageUrl must be public http(s) URL if provided) */
// export const createTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { name, profession, message } = (req.body || {}) as any;
//     const ratingRaw = (req.body as any)?.rating;

//     const incomingUrl = String((req.body as any)?.imageUrl ?? (req.body as any)?.image ?? "").trim();
//     if (incomingUrl && !/^https?:\/\//i.test(incomingUrl)) {
//       return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//     }

//     const row = await Testimonial.create({
//       userId,
//       templateId,
//       name,
//       profession,
//       message,
//       rating: ratingRaw !== undefined && ratingRaw !== null ? Number(ratingRaw) : undefined,
//       imageUrl: incomingUrl || "",
//     });

//     res.status(201).json({
//       message: "✅ Testimonial created",
//       data: {
//         ...row.toObject(),
//         imageKey: "",                  // legacy
//         imageUrl: row.imageUrl || "",
//       },
//     });
//   } catch (err: any) {
//     if (err?.name === "ValidationError") {
//       return res.status(400).json({
//         error: "Validation failed",
//         details: Object.fromEntries(
//           Object.entries(err.errors || {}).map(([k, v]: any) => [k, v.message])
//         ),
//       });
//     }
//     console.error(err);
//     res.status(500).json({ error: "Failed to create testimonial" });
//   }
// };

// /** UPDATE testimonial (fields + optional new public image URL or removeImage) */
// export const updateTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;
//     const { name, profession, message, rating, imageUrl, image, removeImage } = (req.body || {}) as any;

//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     if (typeof name !== "undefined") row.name = name;
//     if (typeof profession !== "undefined") row.profession = profession;
//     if (typeof message !== "undefined") row.message = message;
//     if (typeof rating !== "undefined" && rating !== null) row.rating = Number(rating);

//     const incomingUrl = String(imageUrl ?? image ?? "").trim();
//     if (incomingUrl) {
//       if (!/^https?:\/\//i.test(incomingUrl)) {
//         return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//       }
//       row.imageUrl = incomingUrl;
//     } else if (removeImage === "true" || removeImage === true) {
//       row.imageUrl = "";
//     }

//     const updated = await row.save();
//     res.status(200).json({
//       message: "✅ Testimonial updated",
//       data: {
//         ...updated.toObject(),
//         imageKey: "",                   // legacy
//         imageUrl: updated.imageUrl || "",
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update testimonial" });
//   }
// };

// /** DELETE testimonial (no storage deletion needed) */
// export const deleteTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;

//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     await Testimonial.findByIdAndDelete(id);
//     res.status(200).json({ message: "✅ Testimonial deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete testimonial" });
//   }
// };

// /** NEW: clear only the testimonial image URL */
// export const clearTestimonialImage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;
//     const updated = await Testimonial.findByIdAndUpdate(
//       id,
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: "Testimonial not found" });
//     res.json({ message: "Image cleared", data: updated });
//   } catch (err) {
//     console.error("clearTestimonialImage error:", err);
//     res.status(500).json({ error: "Failed to clear testimonial image" });
//   }
// };

// /** NEW: issue short-lived token + upload URL for cPanel (same flow as hero) */
// export const getTestimonialUploadToken = async (req: Request, res: Response) => {
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
//     console.error("getTestimonialUploadToken error:", e);
//     return res.status(500).json({ error: "Failed to create upload token" });
//   }
// };
