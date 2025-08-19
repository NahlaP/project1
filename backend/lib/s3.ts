
// og code
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g. ap-south-1
  // no credentials: EC2 IAM role will be used
});




// // src/lib/s3-get.ts
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3 = new S3Client({ region: process.env.AWS_REGION! });

// export const signGetUrl = (key: string, ttl = 86400) => // 24h
//   getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }), { expiresIn: ttl });

// export const extractKey = (urlOrKey = "") => {
//   try { const u = new URL(urlOrKey); return decodeURIComponent(u.pathname.replace(/^\/+/, "")); }
//   catch { return urlOrKey.replace(/^\/+/, ""); }
// };
