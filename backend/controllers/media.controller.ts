// // backend/controllers/media.controller.ts
// import { Request, Response } from "express";
// import Media from "../models/Media";
// import { checkMediaInUse } from "../utils/mediaInUse";
// import { deleteFromS3, getSignedDownloadUrl } from "../lib/s3Helpers";

// export const listMedia = async (req: Request, res: Response) => {
//   try {
//     // ✅ accept BOTH styles:
//     // 1) /api/media/:userId/:templateId
//     // 2) /api/media?userId=&templateId=&type=
//     const userId =
//       (req.params.userId as string) || (req.query.userId as string);
//     const templateId =
//       (req.params.templateId as string) || (req.query.templateId as string);

//     let type = (req.query.type as string | undefined) || undefined;

//     if (!userId || !templateId) {
//       return res.status(400).json({
//         error: "MISSING_PARAMS",
//         message: "userId and templateId are required",
//       });
//     }

//     // ✅ normalize UI type -> DB type
//     if (type === "images") type = "image";
//     if (type === "videos") type = "video";

//     const filter: any = { userId, templateId };
//     if (type === "image" || type === "video") filter.type = type;

//     const items = await Media.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.json({ items });
//   } catch (err: any) {
//     return res.status(500).json({
//       error: "LIST_MEDIA_FAILED",
//       message: err?.message || "Failed to list media",
//     });
//   }
// };

// export const checkUsage = async (req: Request, res: Response) => {
//   try {
//     const { mediaId } = req.params;
//     const result = await checkMediaInUse(mediaId);
//     return res.json(result);
//   } catch (err: any) {
//     return res.status(500).json({
//       error: "CHECK_USAGE_FAILED",
//       message: err?.message || "Failed to check usage",
//     });
//   }
// };

// export const deleteMedia = async (req: Request, res: Response) => {
//   try {
//     const { mediaId } = req.params;

//     const usage = await checkMediaInUse(mediaId);
//     if (usage.inUse) {
//       return res.status(400).json({
//         error: "MEDIA_IN_USE",
//         message:
//           "This file is currently used in the website. Remove it from that section to delete.",
//         usedIn: usage.usedIn,
//       });
//     }

//     const media = await Media.findById(mediaId);
//     if (!media) {
//       return res.status(404).json({ error: "MEDIA_NOT_FOUND" });
//     }

//     const key =
//       (media as any).key ||
//       (media as any).imageKey ||
//       (media as any).url || // sometimes key stored in url
//       "";

//     if (key) {
//       try {
//         await deleteFromS3(key);
//       } catch (e) {
//         console.warn("S3 delete failed:", e);
//       }
//     }

//     await media.deleteOne();
//     return res.json({ ok: true });
//   } catch (err: any) {
//     return res.status(500).json({
//       error: "DELETE_MEDIA_FAILED",
//       message: err?.message || "Failed to delete media",
//     });
//   }
// };

// export const downloadMedia = async (req: Request, res: Response) => {
//   try {
//     const { mediaId } = req.params;
//     const media = await Media.findById(mediaId).lean();

//     if (!media) {
//       return res.status(404).json({ error: "MEDIA_NOT_FOUND" });
//     }

//     const key =
//       (media as any).key ||
//       (media as any).imageKey ||
//       (media as any).url || // if url stores s3 key
//       "";

//     if (key) {
//       const url = await getSignedDownloadUrl(key);
//       return res.json({ url });
//     }

//     // fallback (public url)
//     const url = (media as any).url || (media as any).imageUrl || "";
//     return res.json({ url });
//   } catch (err: any) {
//     return res.status(500).json({
//       error: "DOWNLOAD_MEDIA_FAILED",
//       message: err?.message || "Failed to download media",
//     });
//   }
// };









// backend/controllers/media.controller.ts
import { Request, Response } from "express";
import Media from "../models/Media";
import { checkMediaInUse } from "../utils/mediaInUse";
import { deleteFromS3, getSignedDownloadUrl } from "../lib/s3Helpers";

export const listMedia = async (req: Request, res: Response) => {
  try {
    // ✅ accept BOTH styles:
    // 1) /api/media/:userId/:templateId
    // 2) /api/media?userId=&templateId=&type=
    const userId =
      (req.params.userId as string) || (req.query.userId as string);
    const templateId =
      (req.params.templateId as string) || (req.query.templateId as string);

    let type = (req.query.type as string | undefined) || undefined;

    if (!userId || !templateId) {
      return res.status(400).json({
        error: "MISSING_PARAMS",
        message: "userId and templateId are required",
      });
    }

    // ✅ normalize UI type -> DB type
    if (type === "images") type = "image";
    if (type === "videos") type = "video";

    const filter: any = { userId, templateId };
    if (type === "image" || type === "video") filter.type = type;

    const rows = await Media.find(filter).sort({ createdAt: -1 }).lean<any>();

    // 🔑 IMPORTANT: attach usable URL for preview
    const items = await Promise.all(
      rows.map(async (m: any) => {
        // try to figure out the S3 key
        const key =
          m.key ||
          m.imageKey ||
          m.url || // sometimes we stored key in url
          m.imageUrl ||
          "";

        let url = "";
        if (key) {
          // presigned download url from uploads bucket
          try {
            url = await getSignedDownloadUrl(key);
          } catch (e) {
            console.warn("listMedia: presign failed for", key, e);
          }
        }

        // fallback: if we already stored a public url
        if (!url) {
          url = m.url || m.imageUrl || "";
        }

        return {
          ...m,
          url, // 👈 what React uses in <img src={url}>
        };
      })
    );

    return res.json({ items });
  } catch (err: any) {
    console.error("LIST_MEDIA_FAILED:", err);
    return res.status(500).json({
      error: "LIST_MEDIA_FAILED",
      message: err?.message || "Failed to list media",
    });
  }
};

export const checkUsage = async (req: Request, res: Response) => {
  try {
    const { mediaId } = req.params;
    const result = await checkMediaInUse(mediaId);
    return res.json(result);
  } catch (err: any) {
    console.error("CHECK_USAGE_FAILED:", err);
    return res.status(500).json({
      error: "CHECK_USAGE_FAILED",
      message: err?.message || "Failed to check usage",
    });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { mediaId } = req.params;

    const usage = await checkMediaInUse(mediaId);
    if (usage.inUse) {
      return res.status(400).json({
        error: "MEDIA_IN_USE",
        message:
          "This file is currently used in the website. Remove it from that section to delete.",
        usedIn: usage.usedIn,
      });
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: "MEDIA_NOT_FOUND" });
    }

    const key =
      (media as any).key ||
      (media as any).imageKey ||
      (media as any).url || // sometimes key stored in url
      "";

    if (key) {
      try {
        await deleteFromS3(key);
      } catch (e) {
        console.warn("S3 delete failed:", e);
      }
    }

    await media.deleteOne();
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE_MEDIA_FAILED:", err);
    return res.status(500).json({
      error: "DELETE_MEDIA_FAILED",
      message: err?.message || "Failed to delete media",
    });
  }
};

export const downloadMedia = async (req: Request, res: Response) => {
  try {
    const { mediaId } = req.params;
    const media = await Media.findById(mediaId).lean<any>();

    if (!media) {
      return res.status(404).json({ error: "MEDIA_NOT_FOUND" });
    }

    const key =
      media.key || media.imageKey || media.url || media.imageUrl || "";

    if (key) {
      const url = await getSignedDownloadUrl(key);
      return res.json({ url });
    }

    // fallback (public url)
    const url = media.url || media.imageUrl || "";
    return res.json({ url });
  } catch (err: any) {
    console.error("DOWNLOAD_MEDIA_FAILED:", err);
    return res.status(500).json({
      error: "DOWNLOAD_MEDIA_FAILED",
      message: err?.message || "Failed to download media",
    });
  }
};
