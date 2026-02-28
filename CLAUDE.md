# Uni Boilerplate — Claude 지침서

외주 랜딩페이지 제작을 위한 Next.js 보일러플레이트입니다.

## 기술 스택

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 + shadcn/ui
- **UI 컴포넌트**: shadcn/ui (`components/ui/` — 자동생성, 수정 가능)
- **Server State**: TanStack Query v5 (`@tanstack/react-query`)
- **Client State**: Zustand v5
- **HTTP Client**: Axios v1.13 (커스텀 인스턴스 `@/lib/axios`)
- **인증**: Auth.js v5 (next-auth@beta), JWT 전략, Google + Credentials
- **ORM**: Prisma 7 (생성 경로: `lib/generated/prisma`)
- **DB**: Supabase PostgreSQL
- **파일 스토리지**: AWS S3 + CloudFront CDN
- **DB 없는 데이터 저장**: Google Sheets API
- **배포**: Vercel / AWS (Docker + EC2 or PM2)

## 프로젝트 구조

```
app/
  api/
    auth/[...nextauth]/route.ts   # Auth.js 핸들러
    upload/presigned/route.ts     # S3 Presigned URL 발급
    sheet/[sheetName]/route.ts    # Google Sheets CRUD
  layout.tsx / page.tsx / globals.css
components/
  common/       # 커스텀 재사용 UI
  container/    # 레이아웃 래퍼
  content/      # 페이지별 콘텐츠
  ui/           # shadcn/ui 자동생성 (수정 가능)
hooks/
  api/          # useQuery / useMutation 훅
  auth/         # useSession.ts
lib/
  axios.ts          # Axios 인스턴스 (반드시 이것 사용)
  auth.ts           # Auth.js v5 설정
  prisma.ts         # PrismaClient 싱글턴
  supabase.ts       # Supabase 클라이언트 (anon + admin)
  s3.ts             # S3Client, getCdnUrl(), generateS3Key()
  googleSheets.ts   # Google Sheets API 클라이언트
  utils.ts          # cn() 헬퍼
  generated/prisma/ # Prisma 자동생성 (수정 금지)
middleware.ts         # 보호된 라우트
prisma/schema.prisma  # DB 스키마
provider/             # RootProvider, QueryProvider, AuthProvider
service/
  uploadS3.ts         # S3 업로드, Presigned URL, 삭제
  getSheetData.ts     # Google Sheets 조회
  appendSheetData.ts  # Google Sheets 행 추가
store/        # Zustand 스토어
types/
  auth.ts     # next-auth 타입 확장
  common.ts   # ApiResponse<T>, PaginatedResponse<T>
  storage.ts  # S3 관련 타입
Dockerfile / .dockerignore    # AWS Docker 배포
ecosystem.config.js           # PM2 설정 (EC2 직접 배포)
```

## 코딩 컨벤션

### 파일 네이밍

- **컴포넌트**: PascalCase → `HeroSection.tsx`, `ContactForm.tsx`
- **훅**: camelCase, `use` 접두사 → `useGetService.ts`, `useCount.ts`
- **서비스**: camelCase, 동사+명사 → `getService.ts`, `uploadS3.ts`
- **스토어**: camelCase, `.store.ts` 접미사 → `auth.store.ts`
- **타입**: camelCase, `.ts` → `auth.ts`, `storage.ts`

### 컴포넌트 패턴

```tsx
import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

export default Button;
```

### shadcn/ui 컴포넌트 사용

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
```

### 서비스 패턴

```ts
import axiosInstance from "@/lib/axios";
import { IItemsResponse } from "@/types/items";

export const getItems = async () => {
  const response = await axiosInstance({ method: "GET", url: "/items" });
  return response.data as IItemsResponse;
};
```

### S3 업로드 패턴

```tsx
// 클라이언트 (Presigned URL 방식)
import { useUploadS3 } from "@/hooks/api/useUploadS3";
const { mutateAsync: upload } = useUploadS3();
const { cdnUrl } = await upload({ file, options: { folder: "images" } });

// 서버 (Buffer 직접 업로드)
import { uploadToS3 } from "@/service/uploadS3";
const { cdnUrl } = await uploadToS3(buffer, filename, contentType, "images");
```

### Google Sheets 패턴

```ts
// 서버에서 조회 (타입 지정 가능)
import { getSheetAsObjects } from "@/service/getSheetData";
const rows = await getSheetAsObjects<{ name: string; email: string }>("Sheet1!A:B");

// 클라이언트에서 행 추가
import { useAppendSheetData } from "@/hooks/api/useAppendSheetData";
const { mutate: append } = useAppendSheetData();
append({ sheetName: "Sheet1", data: { name: "홍길동", email: "hong@example.com" } });
```

### 인증 패턴

```ts
// 서버
import { auth } from "@/lib/auth";
const session = await auth(); // session.user.id, session.user.role

// 클라이언트
import { useSession } from "@/hooks/auth/useSession";
const { user, isAuthenticated, login, logout } = useSession();
```

### Prisma DB 패턴

```ts
// 항상 @/lib/prisma 에서 import
import prisma from "@/lib/prisma";

// CRUD
await prisma.user.create({ data: { name, email } });
await prisma.user.findUnique({ where: { id }, select: { id: true, name: true } });
await prisma.user.findMany({ where: { role }, orderBy: { createdAt: "desc" } });
await prisma.user.update({ where: { id }, data: { role: "admin" } });
await prisma.user.delete({ where: { id } });

// 관계 포함 조회
await prisma.user.findUnique({ where: { id }, include: { accounts: true } });

// 트랜잭션
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { role: "admin" } }),
  prisma.auditLog.create({ data: { userId: id, action: "PROMOTE" } }),
]);
```

> **Prisma 7 주의**: `lib/generated/prisma/client` 에서 자동 생성. `prisma.config.ts`에서 `DATABASE_URL` 관리. `prisma migrate dev`는 Direct URL 필요.

### React Query 패턴

```ts
// hooks/api/useGetItems.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useGetItems = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ["items", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/items", { params });
      return data;
    },
    staleTime: 1000 * 60,
  });

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: unknown) => {
      const { data } = await axiosInstance.post("/items", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
};
```

### Zustand 스토어 패턴

```ts
// store/example.store.ts
import { create } from "zustand";

interface ExampleState {
  value: string | null;
  setValue: (value: string) => void;
  clearValue: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  value: null,
  setValue: (value) => set({ value }),
  clearValue: () => set({ value: null }),
}));

// 컴포넌트에서 — 필요한 상태만 선택 구독 (불필요한 리렌더링 방지)
const value = useExampleStore((s) => s.value);
const setValue = useExampleStore((s) => s.setValue);
```

> **상태 분리 원칙**: 서버 데이터(API 응답)는 React Query, UI·설정·일시적 상태는 Zustand.

### 폼 처리 패턴

```tsx
// react-hook-form + zod + shadcn Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormData = z.infer<typeof schema>;

export default function ExampleForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await someAction(data);
    } catch {
      form.setError("email", { message: "서버 에러 메시지" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          제출
        </Button>
      </form>
    </Form>
  );
}
```

### 타입 패턴

```ts
export interface IExampleResponse {
  id: number;
  name: string;
}
```

## 주요 명령어

```bash
npm run dev           # 개발 서버
npm run build         # 프로덕션 빌드
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷

# Prisma
npx prisma db push    # 스키마 동기화 (개발)
npx prisma migrate dev --name [name]  # 마이그레이션 (Direct URL 필요)
npx prisma studio     # DB GUI

# 배포
docker build -t app . && docker run -p 3000:3000 --env-file .env.local app
pm2 start ecosystem.config.js  # EC2 직접 배포
```

## 커스텀 커맨드 (슬래시 명령어)

| 커맨드                       | 설명                           |
| ---------------------------- | ------------------------------ |
| `/project:new-component`     | 새 컴포넌트 생성               |
| `/project:new-page`          | 새 페이지 + 레이아웃 생성      |
| `/project:new-hook`          | 새 커스텀 훅 생성              |
| `/project:new-service`       | 서비스 + API 훅 쌍 생성        |
| `/project:new-store`         | 새 Zustand 스토어 생성         |
| `/project:new-auth-page`     | 로그인/회원가입 페이지 생성    |
| `/project:new-sheet-service` | Google Sheets 서비스 + 폼 생성 |
| `/project:review`            | 현재 변경사항 코드 리뷰        |

## 환경변수 (.env.local)

`.env.example` 참고. 주요 그룹:

- **DB**: `DATABASE_URL`, `DATABASE_DIRECT_URL`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Auth**: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- **AWS S3**: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_CLOUDFRONT_DOMAIN`
- **Google Sheets**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`

## 주의사항

- `@/` 경로 alias 사용 (tsconfig.json 기준)
- `"use client"` 는 클라이언트 컴포넌트에만 명시
- Axios 인스턴스는 반드시 `@/lib/axios` 사용 (S3 presigned URL 업로드만 예외 — `axios` 직접 사용)
- `lib/generated/prisma/` 수정 금지
- `supabaseAdmin`, `s3Client`, `sheets` 는 서버 사이드 전용
- `GOOGLE_PRIVATE_KEY` 는 `\n`이 이스케이프된 형태로 저장, `lib/googleSheets.ts`에서 자동 복원
- Google Sheets 스프레드시트 첫 번째 행이 헤더 역할
- `next.config.ts`의 `output: "standalone"` 은 Vercel 배포 시 무시됨 (공존 가능)

## 개발 가이드 참조 (SKILL.md)

패턴별 상세 예시는 `SKILL.md`를 참고합니다.

| #   | 섹션             | 주요 내용                                        |
| --- | ---------------- | ------------------------------------------------ |
| 1   | 환경 설정        | 첫 시작, 명령어, Supabase 연결                   |
| 2   | 메인 페이지 구성 | 페이지·레이아웃, shadcn/ui 활용                  |
| 3   | Auth 플로우      | 로그인, 회원가입, 세션, 보호 라우트, RBAC        |
| 4   | AWS S3 & CDN     | Presigned URL, 서버 업로드, 삭제                 |
| 5   | Google Sheets    | 데이터 조회·추가, API Route                      |
| 6   | 배포             | Vercel, Docker, PM2, 환경변수                    |
| 7   | 데이터 패칭      | Axios, useQuery, useMutation, Optimistic Update  |
| 8   | 폼 처리          | react-hook-form + zod, 파일 업로드 폼            |
| 9   | DB 패턴          | Prisma CRUD, 관계형 쿼리, 페이지네이션, 트랜잭션 |
| 10  | 상태 관리        | Zustand 스토어, persist, immer, React Query 연동 |
