

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


