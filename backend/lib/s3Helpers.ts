// backend/lib/s3Helpers.ts
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3";

const BUCKET = process.env.S3_BUCKET!;
if (!BUCKET) {
  console.warn("S3_BUCKET env missing. s3Helpers will not work correctly.");
}

/**
 * Delete an object from S3 by key
 */
export async function deleteFromS3(key: string) {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Return a presigned GET url to download/view object
 * (your uploads are private, so this is required)
 */
export async function getSignedDownloadUrl(key: string, expiresInSec = 60 * 10) {
  if (!key) throw new Error("Missing S3 key");

  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, cmd, { expiresIn: expiresInSec });
  return signedUrl;
}
