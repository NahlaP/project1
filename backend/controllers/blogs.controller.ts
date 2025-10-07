// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Blog from "../models/Blog";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------- helpers ---------- */
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
//     console.warn("Blogs presign failed:", key, e);
//     return "";
//   }
// }

// const ABS = /^https?:\/\//i;
// function cleanKey(candidate?: string) {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS.test(k)) return ""; // store S3 keys only
//   return k;
// }

// /* ---------- controllers ---------- */

// // GET all posts (presigned imageUrl + imageKey)
// export const getBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await Blog.findOne({ userId, templateId }).lean();
//     if (!doc) return res.json({ userId, templateId, items: [] });

//     const items = await Promise.all(
//       (doc.items || []).map(async (it: any) => ({
//         ...it,
//         imageKey: it.imageUrl || "",
//         imageUrl: await presignOrEmpty(it.imageUrl),
//       }))
//     );

//     return res.json({ ...doc, items });
//   } catch (e) {
//     console.error("getBlogs error:", e);
//     return res.status(500).json({ error: "Failed to fetch blogs" });
//   }
// };

// // PUT replace list
// export const upsertBlogs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { items = [] } = (req.body || {}) as any;

//     const norm = (Array.isArray(items) ? items : []).map((it: any, i) => {
//       const key =
//         cleanKey(it.imageKey ?? it.imageUrl) ||
//         (it.imageUrl && !ABS.test(it.imageUrl) ? it.imageUrl : "");
//       const { imageKey, ...rest } = it || {};
//       return {
//         ...rest,
//         imageUrl: key || (rest?.imageUrl || ""),
//         order: Number.isFinite(rest?.order) ? Number(rest.order) : i,
//       };
//     });

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { items: norm } },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blogs saved", result: updated });
//   } catch (e) {
//     console.error("upsertBlogs error:", e);
//     return res.status(500).json({ error: "Failed to save blogs" });
//   }
// };

// // POST add one
// export const addBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;
//     const key =
//       cleanKey(b.imageKey ?? b.imageUrl) ||
//       (b.imageUrl && !ABS.test(b.imageUrl) ? b.imageUrl : "");
//     const { imageKey, ...rest } = b;

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       {
//         $push: {
//           items: {
//             ...rest,
//             imageUrl: key || (rest?.imageUrl || ""),
//           },
//         },
//       },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Blog added", result: doc });
//   } catch (e) {
//     console.error("addBlog error:", e);
//     return res.status(500).json({ error: "Failed to add blog" });
//   }
// };

// // PUT update one by :postId
// export const updateBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const u = (req.body || {}) as any;

//     const set: any = {};
//     for (const k of ["title", "excerpt", "tag", "date", "href", "delay", "order"])
//       if (u[k] !== undefined) set[`items.$.${k}`] = k === "order" ? Number(u[k]) : u[k];

//     const key =
//       cleanKey(u.imageKey ?? u.imageUrl) ||
//       (u.imageUrl && !ABS.test(u.imageUrl) ? u.imageUrl : "");
//     if (key) set["items.$.imageUrl"] = key;

//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: set },
//       { new: true }
//     );

//     return res.json({ message: "✅ Blog updated", result: doc });
//   } catch (e) {
//     console.error("updateBlog error:", e);
//     return res.status(500).json({ error: "Failed to update blog" });
//   }
// };

// // DELETE one by :postId
// export const deleteBlog = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const doc = await Blog.findOneAndUpdate(
//       { userId, templateId },
//       { $pull: { items: { _id: postId } } },
//       { new: true }
//     );
//     return res.json({ message: "✅ Blog removed", result: doc });
//   } catch (e) {
//     console.error("deleteBlog error:", e);
//     return res.status(500).json({ error: "Failed to delete blog" });
//   }
// };

// // POST image multipart → attach to post
// export const uploadBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key;

//     const updated = await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": key } },
//       { new: true }
//     );

//     return res.json({
//       message: "✅ Blog image uploaded",
//       key,
//       result: updated,
//     });
//   } catch (e) {
//     console.error("uploadBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to upload image" });
//   }
// };

// // DELETE image from S3 and clear field
// export const deleteBlogImage = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId, postId } = req.params;

//     const doc = await Blog.findOne({ userId, templateId });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const item = (doc.items || []).find((x: any) => String(x._id) === postId);
//     if (!item || !item.imageUrl) return res.status(404).json({ error: "No image set" });

//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: item.imageUrl as string,
//       }));
//     } catch {/* ignore delete failures */}

//     await Blog.findOneAndUpdate(
//       { userId, templateId, "items._id": postId },
//       { $set: { "items.$.imageUrl": "" } },
//       { new: true }
//     );

//     return res.json({ message: "✅ Image removed" });
//   } catch (e) {
//     console.error("deleteBlogImage error:", e);
//     return res.status(500).json({ error: "Failed to delete image" });
//   }
// };















import { Request, Response } from "express";
import dotenv from "dotenv";
import Blog from "../models/Blog";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ---------- helpers ---------- */
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
      { expiresIn: 300 } // 5m
    );
  } catch (e) {
    console.warn("Blogs presign failed:", key, e);
    return "";
  }
}

const ABS = /^https?:\/\//i;

/** Keep only S3 keys. If absolute URL → return "" so we never persist it. */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip legacy dev absolute path if any
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // never store absolute URLs in DB
  if (ABS.test(k)) return "";
  // trim leading slashes
  k = k.replace(/^\/+/, "");
  return k;
}

/* ---------- controllers ---------- */

/** GET all posts (presigns image keys) */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await Blog.findOne({ userId, templateId }).lean();
    if (!doc) return res.json({ userId, templateId, items: [] });

    const items = await Promise.all(
      (doc.items || []).map(async (it: any) => ({
        ...it,
        imageKey: it.imageUrl || "",
        imageUrl: await presignOrEmpty(it.imageUrl),
      }))
    );

    return res.json({ ...doc, items });
  } catch (e) {
    console.error("getBlogs error:", e);
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

/** PUT replace list (PRESERVE previous image key unless a new key is sent) */
export const upsertBlogs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const incoming = Array.isArray((req.body as any)?.items)
      ? (req.body as any).items
      : [];

    const existing = await Blog.findOne({ userId, templateId }).lean();
    const prev = Array.isArray(existing?.items) ? existing!.items : [];

    const norm = incoming.map((it: any, i: number) => {
      const candKey = cleanKey(it?.imageKey ?? it?.imageUrl); // key if provided
      const prevKey = prev[i]?.imageUrl || "";
      const finalKey = candKey || prevKey;                     // preserve old key

      const order = Number.isFinite(it?.order)
        ? Number(it.order)
        : (prev[i]?.order ?? i);

      const { imageKey, imageUrl, ...rest } = it || {};
      return {
        ...rest,
        imageUrl: finalKey, // always a key or ""
        order,
      };
    });

    const updated = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $set: { items: norm } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Blogs saved", result: updated });
  } catch (e) {
    console.error("upsertBlogs error:", e);
    return res.status(500).json({ error: "Failed to save blogs" });
  }
};

/** POST add one (accept key if sent; otherwise leave empty) */
export const addBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const b = (req.body || {}) as any;

    const candKey = cleanKey(b?.imageKey ?? b?.imageUrl); // key only
    const { imageKey, imageUrl, ...rest } = b || {};

    const doc = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $push: { items: { ...rest, imageUrl: candKey || "" } } },
      { new: true, upsert: true }
    );

    return res.json({ message: "✅ Blog added", result: doc });
  } catch (e) {
    console.error("addBlog error:", e);
    return res.status(500).json({ error: "Failed to add blog" });
  }
};

/** PUT update one by :postId (only change image when a NEW key is sent) */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const u = (req.body || {}) as any;

    const set: any = {};
    for (const k of ["title", "excerpt", "tag", "date", "href", "delay", "order"]) {
      if (u[k] !== undefined) set[`items.$.${k}`] = k === "order" ? Number(u[k]) : u[k];
    }

    const candKey = cleanKey(u?.imageKey ?? u?.imageUrl); // key only; ignore absolute
    if (candKey) set["items.$.imageUrl"] = candKey;

    const doc = await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: set },
      { new: true }
    );

    return res.json({ message: "✅ Blog updated", result: doc });
  } catch (e) {
    console.error("updateBlog error:", e);
    return res.status(500).json({ error: "Failed to update blog" });
  }
};

/** DELETE one by :postId */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const doc = await Blog.findOneAndUpdate(
      { userId, templateId },
      { $pull: { items: { _id: postId } } },
      { new: true }
    );
    return res.json({ message: "✅ Blog removed", result: doc });
  } catch (e) {
    console.error("deleteBlog error:", e);
    return res.status(500).json({ error: "Failed to delete blog" });
  }
};

/** POST image multipart → save S3 key into this post */
export const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key;

    const updated = await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: { "items.$.imageUrl": key } },
      { new: true }
    );

    return res.json({
      message: "✅ Blog image uploaded",
      key,
      result: updated,
    });
  } catch (e) {
    console.error("uploadBlogImage error:", e);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};

/** DELETE image from S3 and clear field */
export const deleteBlogImage = async (req: Request, res: Response) => {
  try {
    const { userId, templateId, postId } = req.params;

    const doc = await Blog.findOne({ userId, templateId });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const item = (doc.items || []).find((x: any) => String(x._id) === postId);
    if (!item || !item.imageUrl) return res.status(404).json({ error: "No image set" });

    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: item.imageUrl as string,
      }));
    } catch {
      /* ignore delete failures */
    }

    await Blog.findOneAndUpdate(
      { userId, templateId, "items._id": postId },
      { $set: { "items.$.imageUrl": "" } },
      { new: true }
    );

    return res.json({ message: "✅ Image removed" });
  } catch (e) {
    console.error("deleteBlogImage error:", e);
    return res.status(500).json({ error: "Failed to delete image" });
  }
};
