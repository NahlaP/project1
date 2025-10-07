



// import { Request, Response } from "express";
// import Testimonial from "../models/Testimonial";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const presign = async (key?: string) => {
//   if (!key) return "";
//   if (typeof key === "string" && key.startsWith("/uploads/")) return ""; // legacy
//   return getSignedUrl(
//     s3,
//     new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//     { expiresIn: 60 }
//   );
// };

// // GET all testimonials for a user/template
// export const getTestimonials = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });

//     const withUrls = await Promise.all(
//       rows.map(async (t) => {
//         const obj = t.toObject();
//         return {
//           ...obj,
//           imageKey: obj.imageUrl || "",
//           imageUrl: await presign(obj.imageUrl),
//         };
//       })
//     );

//     res.status(200).json(withUrls);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch testimonials" });
//   }
// };

// // CREATE testimonial (accepts file upload or imageKey)
// export const createTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const { name, profession, message, rating, imageKey } = req.body as any;

//     const file = (req as any).file;
//     const key = file?.key || imageKey || "";  // <-- S3 key

//     const row = await Testimonial.create({
//       userId,
//       templateId,
//       name,
//       profession,
//       message,
//       rating: rating !== undefined ? Number(rating) : undefined,
//       imageUrl: key,                           // store S3 key in DB
//     });

//     res.status(201).json({
//       message: "✅ Testimonial created",
//       data: {
//         ...row.toObject(),
//         imageKey: key,
//         imageUrl: key ? await presign(key) : "",
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

// // UPDATE testimonial (fields + optional new image or imageKey)
// export const updateTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, profession, message, rating, imageKey, removeImage } = req.body as any;

//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     if (name) row.name = name;
//     if (profession) row.profession = profession;
//     if (message) row.message = message;
//     if (rating !== undefined) row.rating = Number(rating);

//     const file = (req as any).file;
//     if (file?.key) {
//       row.imageUrl = file.key;          // new S3 key
//     } else if (imageKey) {
//       row.imageUrl = imageKey;          // set via key
//     } else if (removeImage === "true" || removeImage === true) {
//       // best-effort delete from S3 if it was there
//       if (row.imageUrl && !row.imageUrl.startsWith("/uploads/")) {
//         try {
//           await s3.send(new DeleteObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: row.imageUrl as string,
//           }));
//         } catch {}
//       }
//       row.imageUrl = "";
//     }

//     const updated = await row.save();
//     res.status(200).json({
//       message: "✅ Testimonial updated",
//       data: {
//         ...updated.toObject(),
//         imageKey: updated.imageUrl || "",
//         imageUrl: await presign(updated.imageUrl),
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update testimonial" });
//   }
// };

// // DELETE testimonial (+ best-effort delete image from S3)
// export const deleteTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const row = await Testimonial.findById(id);
//     if (!row) return res.status(404).json({ error: "Testimonial not found" });

//     if (row.imageUrl && !row.imageUrl.startsWith("/uploads/")) {
//       try {
//         await s3.send(new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: row.imageUrl as string,
//         }));
//       } catch {}
//     }

//     await Testimonial.findByIdAndDelete(id);
//     res.status(200).json({ message: "✅ Testimonial deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete testimonial" });
//   }
// };










import { Request, Response } from "express";
import Testimonial from "../models/Testimonial";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  if (/^\/uploads\//.test(String(key))) return ""; // legacy local path
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: String(key) }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Presign failed:", key, e);
    return "";
  }
}

function cleanKeyCandidate(candidate?: string) {
  let key = String(candidate ?? "");
  if (!key) return "";
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, ""); // strip accidental local path
  if (/^https?:\/\//i.test(key)) return ""; // we store S3 key only (not full URL)
  return key;
}

/* ---------------- handlers ---------------- */

// GET all testimonials (returns imageKey + presigned imageUrl)
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const rows = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });

    const withUrls = await Promise.all(
      rows.map(async (t) => {
        const obj = t.toObject();
        const imageKey = obj.imageUrl || "";
        const imageUrl = await presignOrEmpty(imageKey);
        return { ...obj, imageKey, imageUrl };
      })
    );

    return res.status(200).json(withUrls);
  } catch (err) {
    console.error("getTestimonials error:", err);
    return res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// CREATE testimonial (multipart optional OR body.imageKey/body.imageUrl)
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { name, profession, message, rating } = (req.body || {}) as any;

    const file = (req as any).file;
    const incomingKey =
      file?.key ||
      cleanKeyCandidate((req.body as any).imageKey ?? (req.body as any).imageUrl) ||
      "";

    const row = await Testimonial.create({
      userId,
      templateId,
      name,
      profession,
      message,
      rating: rating !== undefined ? Number(rating) : undefined,
      imageUrl: incomingKey, // store S3 key
    });

    return res.status(201).json({
      message: "✅ Testimonial created",
      data: {
        ...row.toObject(),
        imageKey: row.imageUrl || "",
        imageUrl: await presignOrEmpty(row.imageUrl),
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
    console.error("createTestimonial error:", err);
    return res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// UPDATE testimonial (fields + optional new image or imageKey)
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, profession, message, rating, imageKey, imageUrl, removeImage } =
      (req.body || {}) as any;

    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (name !== undefined) row.name = name;
    if (profession !== undefined) row.profession = profession;
    if (message !== undefined) row.message = message;
    if (rating !== undefined) row.rating = Number(rating);

    const file = (req as any).file;
    if (file?.key) {
      row.imageUrl = file.key;
    } else {
      const key = cleanKeyCandidate(imageKey ?? imageUrl);
      if (key) {
        row.imageUrl = key;
      } else if (removeImage === "true" || removeImage === true) {
        if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: row.imageUrl,
              })
            );
          } catch {
            // ignore delete errors
          }
        }
        row.imageUrl = "";
      }
    }

    const updated = await row.save();
    return res.status(200).json({
      message: "✅ Testimonial updated",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: await presignOrEmpty(updated.imageUrl),
      },
    });
  } catch (err) {
    console.error("updateTestimonial error:", err);
    return res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// DELETE testimonial (+ best-effort delete image from S3)
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await Testimonial.findById(id);
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

    if (row.imageUrl && !/^\/uploads\//.test(row.imageUrl)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: row.imageUrl,
          })
        );
      } catch {
        // ignore
      }
    }

    await Testimonial.findByIdAndDelete(id);
    return res.status(200).json({ message: "✅ Testimonial deleted" });
  } catch (err) {
    console.error("deleteTestimonial error:", err);
    return res.status(500).json({ error: "Failed to delete testimonial" });
  }
};

// OPTIONAL: JSON/base64 upload (attach to an existing testimonial ID)
export const uploadTestimonialImageBase64 = async (req: Request, res: Response) => {
  try {
    const { id, userId, templateId } = req.params;
    const row = await Testimonial.findOne({ _id: id, userId, templateId });
    if (!row) return res.status(404).json({ error: "Testimonial not found" });

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
    const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const key = `sections/testimonials/${id}/${Date.now()}-${base}${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: Buffer.from(b64, "base64"),
        ContentType:
          ext === ".png" ? "image/png" :
          ext === ".webp" ? "image/webp" :
          ext === ".gif" ? "image/gif" : "image/jpeg",
        ACL: "private",
      })
    );

    row.imageUrl = key;
    const updated = await row.save();

    return res.json({
      message: "✅ Testimonial image uploaded (base64)",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: await presignOrEmpty(updated.imageUrl),
      },
    });
  } catch (e) {
    console.error("uploadTestimonialImageBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload testimonial image (base64)" });
  }
};
