"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { S3UploadResult, UploadOptions } from "@/types/storage";

interface UploadParams {
  file: File;
  options?: UploadOptions;
}

/**
 * S3 파일 업로드 훅 (Presigned URL 방식)
 * 1. API에서 Presigned URL 발급
 * 2. S3에 직접 PUT 업로드
 * 3. CDN URL 반환
 */
export const useUploadS3 = () => {
  return useMutation<S3UploadResult, Error, UploadParams>({
    mutationFn: async ({ file, options = {} }) => {
      const { folder = "uploads" } = options;

      // 1. Presigned URL 발급
      const { data } = await axiosInstance({
        method: "POST",
        url: "/api/upload/presigned",
        data: {
          filename: file.name,
          contentType: file.type,
          folder,
          sizeMb: file.size / (1024 * 1024),
        },
      });

      // 2. S3에 직접 업로드 (Presigned URL 사용)
      await axios.put(data.presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      return { key: data.key, cdnUrl: data.cdnUrl };
    },
  });
};
