// backend/services/storageUsage.service.ts
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "ap-south-1";
const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  throw new Error("S3_BUCKET is missing in environment");
}

// Single S3 client reused for all calls
const client = new S3Client({ region: REGION });

/**
 * Sum the size of all objects in the configured S3 bucket.
 * Returns total bytes. If anything fails, it logs and returns 0
 * so that the dashboard widget can still render.
 */
export async function getS3UsageBytes(): Promise<number> {
  let totalBytes = 0;
  let continuationToken: string | undefined;

  try {
    do {
      const cmd = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        ContinuationToken: continuationToken,
      });

      // Explicit type so TS knows about IsTruncated, NextContinuationToken, etc.
      const res: ListObjectsV2CommandOutput = await client.send(cmd);

      for (const obj of res.Contents ?? []) {
        if (obj.Size) {
          totalBytes += obj.Size;
        }
      }

      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error("[storage] error while listing S3 objects", err);
    // fail soft – just return 0 so widget still renders
    return 0;
  }

  return totalBytes;
}
