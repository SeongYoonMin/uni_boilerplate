import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/service/uploadS3";
import { getCdnUrl, generateS3Key } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, folder = "uploads", sizeMb } = await req.json();

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "허용되지 않는 파일 형식입니다." }, { status: 400 });
  }
  if (sizeMb && sizeMb > MAX_SIZE_MB) {
    return NextResponse.json(
      { error: `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.` },
      { status: 400 }
    );
  }

  const key = generateS3Key(filename, folder);
  const presignedUrl = await getPresignedUploadUrl(key, contentType);
  const cdnUrl = getCdnUrl(key);

  return NextResponse.json({ presignedUrl, cdnUrl, key });
}
