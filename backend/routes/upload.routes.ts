
// import express from "express";
// import { upload } from "../middleware/upload";
// import path from "path";

// const router = express.Router();

// // 🔁 Reusable POST endpoint: /api/upload/:folder
// // Example: /api/upload/topbar → saves to uploads/topbar/
// router.post("/:folder", (req, res, next) => {
//   const { folder } = req.params;
//   const uploader = upload.single("image");

//   // Override destination dynamically based on :folder
//   req.params.folder = folder;
//   uploader(req, res, function (err) {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     return res.status(200).json({
//       message: "✅ File uploaded",
//       imageUrl: `/uploads/${folder}/${req.file.filename}`,
//     });
//   });
// });

// export default router;
import express, { Request, Response, NextFunction } from "express";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/:folder", (req: Request, res: Response, next: NextFunction) => {
  const { folder } = req.params;
  const uploader = upload.single("image");

  req.params.folder = folder;

  uploader(req, res, function (err: any) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const file = (req as any).file; // 👈 Fix TypeScript complaining
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    return res.status(200).json({
      message: "✅ File uploaded",
      imageUrl: `/uploads/${folder}/${file.filename}`,
    });
  });
});

export default router;
