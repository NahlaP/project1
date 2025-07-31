
import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload directory
const baseDir = path.join(__dirname, "..", "uploads");

// Helper to ensure folder exists
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage that allows subfolder control
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Support dynamic subfolder like "topbar"
    const folder = req.params.folder || ""; // folder from route param
    const uploadDir = path.join(baseDir, folder);

    ensureDir(uploadDir); // ensure folder exists
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Export with folder param expected in route (e.g., /upload/topbar)
export const upload = multer({
  storage,
  fileFilter(_, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});
