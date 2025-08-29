



// // og code for ec2 but cant upload image in browser
// import express from "express";
// import { upload } from "../middleware/upload";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const router = express.Router();

// /**
//  * GET /api/upload/file-url?key=<s3-key>
//  * Returns a short-lived presigned URL so the browser can view/download the object.
//  */
// router.get("/file-url", async (req, res) => {
//   try {
//     const key = req.query.key as string;
//     if (!key) return res.status(400).json({ error: "key required" });

//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }),
//       { expiresIn: 60 }
//     );

//     res.json({ url });
//   } catch (e: any) {
//     res.status(500).json({ error: e?.message || "Failed to sign URL" });
//   }
// });


// router.post("/:userId/:templateId/:rest*", (req, res) => {
//   const { userId, templateId } = req.params as { userId: string; templateId: string };

//   // Support both older Express (splat in params[0]) and named splat (params.rest).
//   const rawRest = (req.params as any).rest ?? (req.params as any)[0] ?? "";
//   const rest = Array.isArray(rawRest) ? rawRest.join("/") : (rawRest as string);

//   // Basic sanitization for folder parts
//   const clean = (s: string) => s.replace(/[^a-zA-Z0-9/_-]/g, "");

//   // Folder structure used by the multer-s3 key builder
//   const folder = `users/${clean(userId)}/${clean(templateId)}/${clean(rest)}`.replace(/\/+/g, "/");

//   // Expose folder to the multer-s3 key generator (your middleware reads this)
//   (req as any).params.folder = folder;

//   // Optional safety: ensure bucket exists in env (multer-s3 will also require it)
//   if (!process.env.S3_BUCKET) {
//     return res.status(500).json({ error: "S3_BUCKET not configured on server" });
//   }

//   // Perform the upload
//   upload.single("image")(req, res, (err: any) => {
//     if (err) return res.status(500).json({ error: err.message });

//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     // file.key will look like: users/<userId>/<templateId>/hero/169xxx-image.jpg
//     return res.status(200).json({
//       message: "✅ Uploaded",
//       key: file.key,
//       bucket: file.bucket,
//       folder,
//     });
//   });
// });

// export default router;




// routes/upload.routes.ts — Express 5 safe (no wildcard in path)
import express, { Request, Response } from "express";
import { upload } from "../middleware/upload";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = express.Router();

/**
 * GET /api/upload/file-url?key=<s3-key>
 * Returns a short-lived presigned URL so the browser can view/download the object.
 */
router.get("/file-url", async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;
    if (!key) return res.status(400).json({ error: "key required" });

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      }),
      { expiresIn: 60 }
    );

    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to sign URL" });
  }
});

/**
 * POST /api/upload/:userId/:templateId?rest=<sub/path>
 * Example: /api/upload/demo-user/gym-template-1?rest=hero
 *          /api/upload/u1/t1?rest=sections/services/123
 * Body: multipart/form-data with field "image"
 */
router.post("/:userId/:templateId", (req: Request, res: Response) => {
  const { userId, templateId } = req.params as { userId: string; templateId: string };

  // Accept rest as a query param. This supports URL-encoded slashes (%2F).
  const rawRest = (req.query.rest as string) || "";
  const clean = (s: string) => String(s).replace(/[^a-zA-Z0-9/_-]/g, "");
  const folder = `users/${clean(userId)}/${clean(templateId)}/${clean(rawRest)}`.replace(/\/+/g, "/");

  // Expose folder to the multer-s3 key generator (your middleware reads this)
  (req as any).params.folder = folder;

  if (!process.env.S3_BUCKET) {
    return res.status(500).json({ error: "S3_BUCKET not configured on server" });
  }

  upload.single("image")(req, res, (err: any) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    return res.status(200).json({
      message: "✅ Uploaded",
      key: file.key,
      bucket: file.bucket,
      folder,
    });
  });
});

export default router;
