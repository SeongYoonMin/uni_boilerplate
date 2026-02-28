import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME!;
export const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN!;

/** S3 오브젝트 키 → CloudFront CDN URL */
export const getCdnUrl = (key: string): string => {
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
};

/** 업로드 키 생성: {folder}/{uuid}.{ext} */
export const generateS3Key = (filename: string, folder = "uploads"): string => {
  const ext = filename.split(".").pop() ?? "bin";
  return `${folder}/${crypto.randomUUID()}.${ext}`;
};
