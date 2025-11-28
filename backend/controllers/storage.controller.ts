


// // backend/controllers/storage.controller.ts
// import { Request, Response } from "express";
// import { getS3UsageBytes } from "../services/storageUsage.service";

// type AuthedUser = { userId: string; email?: string };
// type AuthedReq = Request & { user?: AuthedUser };

// // 🔒 Fixed storage cap (in GB) – default 5GB if env not set
// const STORAGE_LIMIT_GB = Number(process.env.STORAGE_LIMIT_GB || 5);

// export async function getStorageSummary(req: AuthedReq, res: Response) {
//   try {
//     // 1) figure out userId (from auth middleware or query, just in case)
//     const userId =
//       req.user?.userId ||
//       (req.query.userId as string | undefined) ||
//       (req as any).userId;

//     if (!userId) {
//       return res.status(401).json({
//         ok: false,
//         error: "Unauthenticated – userId missing",
//       });
//     }

//     // 2) Get S3 usage (in bytes) for the whole uploads bucket
//     const usageBytes = await getS3UsageBytes().catch((err) => {
//       console.error("[storage] error while listing S3 objects", err);
//       return 0;
//     });

//     const usedBytes = usageBytes || 0;

//     // Convert to MB / GB
//     const usedMb = usedBytes / (1024 * 1024);
//     const usedGb = usedBytes / (1024 * 1024 * 1024);

//     // 3) Use fixed limit from env (5GB by default)
//     const totalGb = STORAGE_LIMIT_GB > 0 ? STORAGE_LIMIT_GB : 5; // safety
//     const totalMb = totalGb * 1024;

//     const remainingGb = Math.max(0, totalGb - usedGb);
//     const remainingMb = Math.max(0, totalMb - usedMb);
//     const usedPercent = totalGb > 0 ? (usedGb / totalGb) * 100 : 0;

//     return res.json({
//       ok: true,
//       userId,
//       bucket: process.env.S3_BUCKET,
//       // No more Stripe allowance here – purely S3-based
//       storage: {
//         usedBytes,
//         usedMb,
//         usedGb,
//         totalGb,
//         totalMb,
//         remainingGb,
//         remainingMb,
//         usedPercent,
//       },
//     });
//   } catch (err: any) {
//     console.error("[storage] getStorageSummary fatal error", err);
//     return res.status(500).json({
//       ok: false,
//       error: "Failed to load storage summary",
//     });
//   }
// }

// export default {
//   getStorageSummary,
// };














// backend/controllers/storage.controller.ts
import { Request, Response } from "express";
import { getS3UsageBytes } from "../services/storageUsage.service";
import { getStorageAllowanceForUser } from "../services/storageAllowance.service";
import { getEc2DiskUsage } from "../services/storageEc2Usage.service";

type AuthedUser = { userId: string; email?: string };
type AuthedReq = Request & { user?: AuthedUser };

// Fallback plan limits if Stripe/meta is missing
const FALLBACK_BASE_GB = Number(process.env.STORAGE_BASE_GB || 5); // e.g. 5 GB
const FALLBACK_ADDON_GB = Number(process.env.STORAGE_ADDON_GB || 0); // e.g. 0 GB

export async function getStorageSummary(req: AuthedReq, res: Response) {
  try {
    // 1) figure out userId (from auth middleware or query, just in case)
    const userId =
      req.user?.userId ||
      (req.query.userId as string | undefined) ||
      (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Unauthenticated – userId missing",
      });
    }

    // 2) In parallel: S3 usage + Stripe allowance + EC2 disk
    const [s3Bytes, allowance, ec2Disk] = await Promise.all([
      getS3UsageBytes().catch((err) => {
        console.error("[storage] error while listing S3 objects", err);
        return 0;
      }),
      getStorageAllowanceForUser(userId).catch((err) => {
        console.error("[storage] error while reading Stripe allowance", err);
        return null;
      }),
      getEc2DiskUsage().catch((err) => {
        console.error("[storage] error while reading EC2 disk", err);
        return null;
      }),
    ]);

    // ---- S3 usage as "user storage" ----
    const usedBytes = s3Bytes || 0;
    const usedMb = usedBytes / (1024 * 1024);
    const usedGb = usedMb / 1024;

    // ---- Merge Stripe allowance with fallbacks ----
    let baseGb = allowance?.baseGb ?? FALLBACK_BASE_GB;
    let addonGb = allowance?.addonGb ?? FALLBACK_ADDON_GB;
    let totalGb = allowance?.totalGb ?? baseGb + addonGb;

    if (totalGb <= 0) {
      totalGb = baseGb + addonGb;
    }

    const totalMb = totalGb * 1024;
    const remainingGb = Math.max(0, totalGb - usedGb);
    const remainingMb = Math.max(0, totalMb - usedMb);
    const usedPercent = totalGb > 0 ? (usedGb / totalGb) * 100 : 0;

    // ---- EC2 disk info (optional, for infra view) ----
    let ec2TotalGb: number | null = null;
    let ec2UsedGb: number | null = null;
    let ec2UsedPercent: number | null = null;

    if (ec2Disk) {
      ec2TotalGb = ec2Disk.totalBytes / (1024 * 1024 * 1024);
      ec2UsedGb = ec2Disk.usedBytes / (1024 * 1024 * 1024);
      ec2UsedPercent =
        ec2TotalGb > 0 ? (ec2UsedGb / ec2TotalGb) * 100 : null;
    }

    return res.json({
      ok: true,
      userId,
      bucket: process.env.S3_BUCKET,
      stripeAllowance: allowance, // { baseGb, addonGb, totalGb } or null
      storage: {
        // Widget (user-facing) numbers:
        usedBytes,
        usedMb,
        usedGb,
        baseGb,
        addonGb,
        totalGb,
        remainingGb,
        remainingMb,
        usedPercent,

        // Extra EC2 info (if you want a separate infra widget later):
        ec2: ec2Disk
          ? {
              totalGb: ec2TotalGb,
              usedGb: ec2UsedGb,
              usedPercent: ec2UsedPercent,
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error("[storage] getStorageSummary fatal error", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to load storage summary",
    });
  }
}

export default {
  getStorageSummary,
};
