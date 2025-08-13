import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g. ap-south-1
  // no credentials: EC2 IAM role will be used
});
