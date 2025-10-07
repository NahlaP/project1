// og

// import multer from "multer";
// import path from "path";
// import multerS3 from "multer-s3";
// import type { Request } from "express";
// import { s3 } from "../lib/s3";

// type RouteParams = { folder?: string };

// const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) cb(null, true);
//   else cb(new Error("Only image files are allowed!"));
// };

// const storage = multerS3({
//   s3,
//   bucket: process.env.S3_BUCKET!,               // e.g. project1-uploads-12345
//   contentType: multerS3.AUTO_CONTENT_TYPE,      // keep original mime
//   // keep objects private (no ACL) — use presigned GET to view
//   key: (req: Request<RouteParams>, file, cb) => {
//     const folder = (req.params?.folder ?? "").replace(/[^a-zA-Z0-9/_-]/g, "");
//     const ext = path.extname(file.originalname).toLowerCase();
//     const base = path
//       .basename(file.originalname, ext)
//       .replace(/\s+/g, "-")
//       .replace(/[^a-zA-Z0-9_-]/g, "");
//     const filename = `${Date.now()}-${file.fieldname}-${base}${ext}`;
//     cb(null, `${folder ? folder + "/" : ""}${filename}`);
//   },
// });

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });












import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import type { Request } from "express";
import { s3 } from "../lib/s3";

type RouteParams = { folder?: string };

// ----- MIME whitelists -----
const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",     // .mov
  "video/x-matroska",    // .mkv (optional)
]);

const isImage = (m: string) => (m || "").toLowerCase().startsWith("image/") || IMAGE_MIME.has((m || "").toLowerCase());
const isVideo = (m: string) => (m || "").toLowerCase().startsWith("video/") || VIDEO_MIME.has((m || "").toLowerCase());

// Validate by *field name*:
//  - "image" / "poster" => must be image
//  - "video"            => must be video
//  - other fields       => image OR video (fallback)
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const field = (file.fieldname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  if (field === "image" || field === "poster") {
    if (!isImage(mime)) return cb(new Error("Only image files are allowed!"));
    return cb(null, true);
  }

  if (field === "video") {
    if (!isVideo(mime)) return cb(new Error("Only video files are allowed!"));
    return cb(null, true);
  }

  // default: allow either
  if (isImage(mime) || isVideo(mime)) return cb(null, true);

  return cb(new Error("Only image or video files are allowed!"));
};

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET!,               // e.g. project1-uploads-12345
  contentType: multerS3.AUTO_CONTENT_TYPE,      // keep original mime
  // keep objects private — use presigned GET to view
  key: (req: Request<RouteParams>, file, cb) => {
    const folder = (req.params?.folder ?? "").replace(/[^a-zA-Z0-9/_-]/g, "");
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${Date.now()}-${file.fieldname}-${base}${ext}`;
    cb(null, `${folder ? folder + "/" : ""}${filename}`);
  },
});

// NOTE: videos are larger, so raise limit from 10MB to something practical (e.g. 500MB).
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});


