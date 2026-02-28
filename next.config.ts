import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AWS Docker 배포용 standalone 번들 생성
  // Vercel은 이 설정을 무시하므로 공존 가능
  output: "standalone",
};

export default nextConfig;
