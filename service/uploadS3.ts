import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET, getCdnUrl, generateS3Key } from "@/lib/s3";
import { S3UploadResult } from "@/types/storage";

/** 서버에서 Buffer를 직접 S3에 업로드 */
export const uploadToS3 = async (
  body: Buffer,
  filename: string,
  contentType: string,
  folder = "uploads"
): Promise<S3UploadResult> => {
  const key = generateS3Key(filename, folder);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return { key, cdnUrl: getCdnUrl(key) };
};

/** 클라이언트 직접 업로드용 Presigned URL 생성 (유효시간: 5분) */
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
};

/** S3 오브젝트 삭제 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
};
