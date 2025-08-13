
// import express, { Request, Response, NextFunction } from "express";
// import { upload } from "../middleware/upload";

// const router = express.Router();

// router.post("/:folder", (req: Request, res: Response, next: NextFunction) => {
//   const { folder } = req.params;
//   const uploader = upload.single("image");

//   req.params.folder = folder;

//   uploader(req, res, function (err: any) {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     const file = (req as any).file; 
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     return res.status(200).json({
//       message: "✅ File uploaded",
//       imageUrl: `/uploads/${folder}/${file.filename}`,
//     });
//   });
// });

// export default router;



// import express from "express";
// import { upload } from "../middleware/upload";
// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const router = express.Router();

// // Upload (field name = "image")
// router.post("/:folder", upload.single("image"), (req, res) => {
//   const file = (req as any).file;
//   const { folder } = req.params;

//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   // Return S3 info (use /file-url to view)
//   return res.status(200).json({
//     message: "✅ File uploaded",
//     key: file.key,
//     bucket: file.bucket,
//     folder,
//   });
// });

// // Get a short-lived URL to view a private object from S3
// router.get("/file-url", async (req, res) => {
//   try {
//     const key = req.query.key as string;
//     if (!key) return res.status(400).json({ error: "key required" });

//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 60 } // seconds
//     );

//     res.json({ url });
//   } catch (e: any) {
//     res.status(500).json({ error: e.message || "Failed to sign URL" });
//   }
// });

// export default router;



import express from "express";
import { upload } from "../middleware/upload";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = express.Router();

/** Presign any stored key so the browser can view/download it */
router.get("/file-url", async (req, res) => {
  try {
    const key = req.query.key as string;
    if (!key) return res.status(400).json({ error: "key required" });

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 60 }
    );
    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to sign URL" });
  }
});

/**
 * ✅ One endpoint to upload for ANY section, with nested paths.
 * Usage examples:
 *  POST /api/upload/demo-user/gym-template-1/hero
 *  POST /api/upload/demo-user/gym-template-1/hero/banner
 *  POST /api/upload/demo-user/gym-template-1/services/icon1
 * Body: form-data -> image: <file>
 */
router.post("/:userId/:templateId/*", (req, res) => {
  const { userId, templateId } = req.params as { userId: string; templateId: string };
  const rest = ((req.params as any)[0] as string) || ""; // e.g. "hero" or "services/icon1"

  // sanitize pieces a bit
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9/_-]/g, "");
  const folder = `users/${clean(userId)}/${clean(templateId)}/${clean(rest)}`;

  // make folder visible to multer-s3 key builder
  (req as any).params.folder = folder;

  upload.single("image")(req, res, (err: any) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // file.key will be like: users/<uid>/<tid>/hero/169...-image.jpg
    return res.status(200).json({ message: "✅ Uploaded", key: file.key, bucket: file.bucket });
  });
});

export default router;
