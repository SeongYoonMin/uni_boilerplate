import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase pgBouncer 사용 시: Transaction Pooler URL
    // 마이그레이션은 Direct URL 필요 → DATABASE_DIRECT_URL로 교체 후 실행
    url: process.env["DATABASE_URL"],
  },
});
