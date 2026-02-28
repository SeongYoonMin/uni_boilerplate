export interface PresignedUrlResponse {
  presignedUrl: string;
  cdnUrl: string;
  key: string;
}

export interface S3UploadResult {
  key: string;
  cdnUrl: string;
}

export interface UploadOptions {
  folder?: string;
  maxSizeMb?: number;
  allowedTypes?: string[];
}
