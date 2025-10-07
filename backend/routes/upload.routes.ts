



// // og
// // routes/upload.routes.ts — Express 5 safe (no wildcard in path)
// import express, { Request, Response } from "express";
// import { upload } from "../middleware/upload";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const router = express.Router();

// /**
//  * GET /api/upload/file-url?key=<s3-key>
//  * Returns a short-lived presigned URL so the browser can view/download the object.
//  */
// router.get("/file-url", async (req: Request, res: Response) => {
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

// /**
//  * POST /api/upload/:userId/:templateId?rest=<sub/path>
//  * Example: /api/upload/demo-user/gym-template-1?rest=hero
//  *          /api/upload/u1/t1?rest=sections/services/123
//  * Body: multipart/form-data with field "image"
//  */
// router.post("/:userId/:templateId", (req: Request, res: Response) => {
//   const { userId, templateId } = req.params as { userId: string; templateId: string };

//   // Accept rest as a query param. This supports URL-encoded slashes (%2F).
//   const rawRest = (req.query.rest as string) || "";
//   const clean = (s: string) => String(s).replace(/[^a-zA-Z0-9/_-]/g, "");
//   const folder = `users/${clean(userId)}/${clean(templateId)}/${clean(rawRest)}`.replace(/\/+/g, "/");

//   // Expose folder to the multer-s3 key generator (your middleware reads this)
//   (req as any).params.folder = folder;

//   if (!process.env.S3_BUCKET) {
//     return res.status(500).json({ error: "S3_BUCKET not configured on server" });
//   }

//   upload.single("image")(req, res, (err: any) => {
//     if (err) return res.status(500).json({ error: err.message });

//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     return res.status(200).json({
//       message: "✅ Uploaded",
//       key: file.key,
//       bucket: file.bucket,
//       folder,
//     });
//   });
// });

// export default router;














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
 * Body: multipart/form-data with field "image" or "video" (or "poster")
 */
router.post("/:userId/:templateId", (req: Request, res: Response) => {
  const { userId, templateId } = req.params as { userId: string; templateId: string };

  // Accept rest as a query param. This supports URL-encoded slashes (%2F).
  const rawRest = (req.query.rest as string) || "";
  const clean = (s: string) => String(s).replace(/[^a-zA-Z0-9/_-]/g, "");
  const folder = `users/${clean(userId)}/${clean(templateId)}/${clean(rawRest)}`.replace(/\/+/g, "/");

  // Expose folder to the multer-s3 key generator (middleware reads this)
  (req as any).params.folder = folder;

  if (!process.env.S3_BUCKET) {
    return res.status(500).json({ error: "S3_BUCKET not configured on server" });
  }

  // Accept any file field, then pick the one we know
  upload.any()(req, res, (err: any) => {
    if (err) return res.status(500).json({ error: err.message });

    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || !files.length) return res.status(400).json({ error: "No file uploaded" });

    // Prefer image → video → poster, or just take the first
    const preferredOrder = ["image", "video", "poster"];
    const file =
      files.find((f) => preferredOrder.includes((f.fieldname || "").toLowerCase())) ||
      files[0];

    return res.status(200).json({
      message: "✅ Uploaded",
      key: (file as any).key,
      bucket: (file as any).bucket,
      folder,
      field: file.fieldname,
      mimetype: file.mimetype,
    });
  });
});

export default router;
