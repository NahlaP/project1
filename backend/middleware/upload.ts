
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Base upload directory
// const baseDir = path.join(__dirname, "..", "uploads");

// // Helper to ensure folder exists
// function ensureDir(dir: string) {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// }

// // Multer storage that allows subfolder control
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Support dynamic subfolder like "topbar"
//     const folder = req.params.folder || ""; // folder from route param
//     const uploadDir = path.join(baseDir, folder);

//     ensureDir(uploadDir); // ensure folder exists
//     cb(null, uploadDir);
//   },
//   filename: function (_, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-${file.fieldname}${ext}`);
//   },
// });

// // Export with folder param expected in route (e.g., /upload/topbar)
// export const upload = multer({
//   storage,
//   fileFilter(_, file, cb) {
//     if (file.mimetype.startsWith("image/")) cb(null, true);
//     else cb(new Error("Only image files are allowed!"));
//   },
// });


import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import type { Request } from "express";
import { s3 } from "../lib/s3";

type RouteParams = { folder?: string };

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET!,               // e.g. project1-uploads-12345
  contentType: multerS3.AUTO_CONTENT_TYPE,      // keep original mime
  // keep objects private (no ACL) — use presigned GET to view
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

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
