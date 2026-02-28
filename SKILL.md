# SKILL.md — Uni Boilerplate 개발 가이드

이 보일러플레이트에서 자주 쓰는 패턴과 구현 방법을 정리한 실전 가이드입니다.

---

## 목차

1. [환경 설정](#1-환경-설정)
2. [메인 페이지 구성](#2-메인-페이지-구성)
3. [Auth — 인증 플로우](#3-auth--인증-플로우)
   - [3-1 로그인 페이지](#3-1-로그인-페이지)
   - [3-2 회원가입](#3-2-회원가입)
   - [3-3 세션 사용](#3-3-세션-사용)
   - [3-4 보호된 라우트](#3-4-보호된-라우트)
   - [3-5 Role 기반 접근 제어](#3-5-role-기반-접근-제어)
4. [AWS S3 파일 업로드 & CDN](#4-aws-s3-파일-업로드--cdn)
5. [Google Sheets 데이터 연동](#5-google-sheets-데이터-연동)
6. [배포](#6-배포)
7. [데이터 패칭 패턴](#7-데이터-패칭-패턴)
   - [7-1 Axios 인스턴스 & 인터셉터](#7-1-axios-인스턴스--인터셉터)
   - [7-2 서비스 함수 패턴](#7-2-서비스-함수-패턴)
   - [7-3 useQuery 기본·심화](#7-3-usequery-기본심화)
   - [7-4 useMutation 패턴](#7-4-usemutation-패턴)
   - [7-5 Optimistic Update](#7-5-optimistic-update)
   - [7-6 서버 컴포넌트에서 직접 호출](#7-6-서버-컴포넌트에서-직접-호출)
   - [7-7 queryKeys 관리](#7-7-querykeys-관리)
8. [폼 처리](#8-폼-처리)
   - [8-1 기본 폼 패턴](#8-1-기본-폼-패턴)
   - [8-2 Zod 공통 Validator](#8-2-zod-공통-validator)
   - [8-3 로그인 폼 예시](#8-3-로그인-폼-예시)
   - [8-4 파일 업로드 폼](#8-4-파일-업로드-폼)
   - [8-5 useFormState 활용](#8-5-useformstate-활용)
9. [DB 패턴 — Prisma](#9-db-패턴--prisma)
   - [9-1 기본 CRUD](#9-1-기본-crud)
   - [9-2 관계형 쿼리](#9-2-관계형-쿼리)
   - [9-3 페이지네이션](#9-3-페이지네이션)
   - [9-4 트랜잭션](#9-4-트랜잭션)
   - [9-5 API Route에서 Prisma 사용](#9-5-api-route에서-prisma-사용)
10. [상태 관리 — Zustand](#10-상태-관리--zustand)
    - [10-1 기본 스토어 패턴](#10-1-기본-스토어-패턴)
    - [10-2 비동기 액션 패턴](#10-2-비동기-액션-패턴)
    - [10-3 persist 미들웨어 (로컬 저장)](#10-3-persist-미들웨어-로컬-저장)
    - [10-4 immer 미들웨어 (불변성 간소화)](#10-4-immer-미들웨어-불변성-간소화)
    - [10-5 스토어 조합 패턴](#10-5-스토어-조합-패턴)
    - [10-6 React Query와 함께 사용](#10-6-react-query와-함께-사용)

---

## 1. 환경 설정

### 1-1 첫 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local에서 DATABASE_URL, AUTH_SECRET 등 실제 값 입력

# 3. AUTH_SECRET 생성
npx auth secret

# 4. DB 스키마 적용 (Supabase 연결 후)
npx prisma db push

# 5. 개발 서버
npm run dev
```

### 1-2 유용한 명령어

| 명령어                   | 용도                         |
| ------------------------ | ---------------------------- |
| `npm run dev`            | 개발 서버 (`localhost:3000`) |
| `npm run lint`           | ESLint 검사                  |
| `npm run lint:fix`       | ESLint 자동 수정             |
| `npm run format`         | Prettier 전체 포맷           |
| `npm run format:check`   | Prettier 검사만 (CI용)       |
| `npx prisma studio`      | DB GUI 브라우저              |
| `npx prisma db push`     | 스키마 → DB 동기화           |
| `npx prisma migrate dev` | 마이그레이션 생성 + 적용     |

### 1-3 Supabase 연결 (DATABASE_URL 형식)

```
# Transaction Pooler (일반 쿼리)
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct URL (마이그레이션 전용)
DATABASE_DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres
```

> `prisma migrate dev` 실행 시 `prisma.config.ts`의 `url`을 `DATABASE_DIRECT_URL` 값으로 임시 교체 후 실행합니다.

---

## 2. 메인 페이지 구성

### 2-1 페이지 + 레이아웃 구조

```
app/
  layout.tsx          ← RootProvider, lang="ko", Header/Footer 포함
  page.tsx            ← 메인 페이지 (서버 컴포넌트)
  globals.css         ← shadcn CSS 변수 + TailwindCSS
```

### 2-2 메인 페이지 예시

서버 컴포넌트 → 메타데이터 + 레이아웃 구성, 클라이언트 인터랙션은 하위 컴포넌트로 분리합니다.

```tsx
// app/page.tsx
import type { Metadata } from "next";
import MainContainer from "@/components/container/MainContainer";
import HeroSection from "@/components/content/HeroSection";
import FeaturesSection from "@/components/content/FeaturesSection";

export const metadata: Metadata = {
  title: "서비스명",
  description: "서비스 설명",
};

export default function Home() {
  return (
    <MainContainer>
      <HeroSection />
      <FeaturesSection />
    </MainContainer>
  );
}
```

### 2-3 컨테이너 컴포넌트

```tsx
// components/container/MainContainer.tsx
interface MainContainerProps {
  children: React.ReactNode;
}

const MainContainer = ({ children }: MainContainerProps) => {
  return <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>;
};

export default MainContainer;
```

### 2-4 콘텐츠 컴포넌트 (shadcn 활용)

```tsx
// components/content/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center py-24 text-center">
      <Badge variant="secondary" className="mb-4">
        NEW
      </Badge>
      <h1 className="text-5xl font-bold tracking-tight">서비스 제목</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">서비스 설명 문구입니다.</p>
      <div className="mt-8 flex gap-4">
        <Button size="lg">시작하기</Button>
        <Button size="lg" variant="outline">
          더 알아보기
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
```

### 2-5 API 데이터 불러오기

서버 컴포넌트에서 직접 fetch하거나 React Query 훅을 사용합니다.

**서버 컴포넌트에서 직접 Prisma 조회:**

```tsx
// app/page.tsx
import prisma from "@/lib/prisma";

export default async function Home() {
  const items = await prisma.user.findMany({ take: 10 });
  return <ItemList items={items} />;
}
```

**클라이언트에서 React Query 훅:**

```tsx
// components/content/ItemList.tsx
"use client";

import { useGetService } from "@/hooks/api/useGetService";

export default function ItemList() {
  const { data, isLoading, isError } = useGetService();

  if (isLoading) return <p>로딩 중...</p>;
  if (isError) return <p>오류가 발생했습니다.</p>;

  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 2-6 Toast 알림 (Sonner)

```tsx
"use client";

import { toast } from "sonner";

// 성공
toast.success("저장되었습니다.");

// 오류
toast.error("오류가 발생했습니다.");

// 일반
toast("알림 메시지");

// Promise
toast.promise(saveData(), {
  loading: "저장 중...",
  success: "저장 완료!",
  error: "저장 실패",
});
```

---

## 3. Auth — 인증 플로우

인증은 **Auth.js v5 (next-auth@beta)** + **JWT 전략**으로 구성되어 있습니다.

```
lib/auth.ts                            ← NextAuth 설정 (providers, JWT callbacks)
app/api/auth/[...nextauth]/route.ts    ← Auth.js API 핸들러 (자동)
middleware.ts                          ← 보호된 라우트 리다이렉트
hooks/auth/useSession.ts               ← 클라이언트 세션 훅
types/auth.ts                          ← session.user.id / role 타입 확장
```

### 3-1 로그인 페이지

로그인 페이지는 `/login` 경로에 위치합니다 (`lib/auth.ts`의 `pages.signIn` 설정).

```
app/login/
  page.tsx       ← 서버 컴포넌트 (메타데이터)
  LoginForm.tsx  ← 클라이언트 컴포넌트 (폼 로직)
```

**`app/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <LoginForm />
    </main>
  );
}
```

**`app/login/LoginForm.tsx`**

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const handleGoogleLogin = () => signIn("google", { callbackUrl: "/" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    toast.success("로그인 성공!");
    router.push("/");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">로그인</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="이메일" required />
          <Input name="password" type="password" placeholder="비밀번호" required />
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
        <div className="relative text-center text-sm text-muted-foreground">
          <span className="bg-card px-2">또는</span>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          Google로 로그인
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Credentials 인증 구현 (`lib/auth.ts`)

`lib/auth.ts`의 `authorize()` 함수에서 실제 DB 검증 로직을 구현합니다:

```ts
// lib/auth.ts — authorize() 함수 교체
import bcrypt from "bcryptjs"; // npm install bcryptjs @types/bcryptjs

async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
    select: { id: true, email: true, name: true, image: true, role: true, hashedPassword: true },
  });

  if (!user || !user.hashedPassword) return null;

  const isValid = await bcrypt.compare(credentials.password as string, user.hashedPassword);
  if (!isValid) return null;

  return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
},
```

> `prisma/schema.prisma`의 `User` 모델에 `hashedPassword String?` 필드를 추가해야 합니다.

---

### 3-2 회원가입

회원가입은 API Route로 처리하는 것이 일반적입니다.

**`app/api/auth/signup/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, hashedPassword },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
```

**`app/signup/SignupForm.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupForm() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await axiosInstance({
        method: "POST",
        url: "/api/auth/signup",
        data: {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        },
      });
      toast.success("회원가입 완료! 로그인해 주세요.");
      router.push("/login");
    } catch {
      toast.error("회원가입에 실패했습니다.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">회원가입</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" placeholder="이름" required />
          <Input name="email" type="email" placeholder="이메일" required />
          <Input name="password" type="password" placeholder="비밀번호 (8자 이상)" required />
          <Button type="submit" className="w-full">
            회원가입
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

### 3-3 세션 사용

#### 서버 컴포넌트 / API Route

```tsx
// 서버 컴포넌트
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <p>{session.user.name}</p>
      <p>{session.user.email}</p>
      <p>권한: {session.user.role}</p> {/* "user" | "admin" */}
      <p>ID: {session.user.id}</p>
    </div>
  );
}
```

```ts
// API Route에서 세션 확인
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // session.user.id, session.user.role 사용 가능
  return NextResponse.json({ user: session.user });
}
```

#### 클라이언트 컴포넌트

`hooks/auth/useSession.ts` 훅을 사용합니다.

```tsx
"use client";

import { useSession } from "@/hooks/auth/useSession";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useSession();

  if (isLoading) return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={() => login(undefined, { callbackUrl: "/" })}>
        로그인
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.image ?? undefined} />
        <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{user?.name}</span>
      <Button variant="ghost" size="sm" onClick={() => logout({ callbackUrl: "/" })}>
        로그아웃
      </Button>
    </div>
  );
}
```

#### useSession 훅 반환값

```ts
const {
  user, // session.user (null if not authenticated)
  isAuthenticated, // boolean
  isLoading, // boolean (세션 로딩 중)
  status, // "authenticated" | "loading" | "unauthenticated"
  login, // (provider?, options?) => void
  logout, // (options?) => void
} = useSession();
```

---

### 3-4 보호된 라우트

#### middleware.ts — 서버 레벨 보호 (권장)

`middleware.ts`의 `protectedPaths` 배열에 보호할 경로를 추가합니다.

```ts
// middleware.ts
const protectedPaths = ["/dashboard", "/profile", "/admin", "/settings"];
```

미인증 사용자는 `/login?callbackUrl=/원래경로`로 자동 리다이렉트됩니다.

#### 서버 컴포넌트에서 직접 보호

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <Dashboard user={session.user} />;
}
```

#### 클라이언트 컴포넌트에서 조건부 렌더링

```tsx
"use client";

import { useSession } from "@/hooks/auth/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <p>로딩 중...</p>;
  if (!isAuthenticated) return null;

  return <div>인증된 사용자만 보이는 콘텐츠</div>;
}
```

---

### 3-5 Role 기반 접근 제어

#### middleware.ts에서 role 체크

```ts
// middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 일반 보호 라우트
  const protectedPaths = ["/dashboard", "/profile"];
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !req.auth) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
  }

  // 관리자 전용 라우트
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});
```

#### 유저 role 변경 (DB 직접)

```ts
// API Route or Server Action
await prisma.user.update({
  where: { id: userId },
  data: { role: "admin" },
});
```

> JWT 전략 사용 중이므로 role 변경 후 유저가 **재로그인**해야 새 token이 발급됩니다.

#### 컴포넌트에서 role 분기

```tsx
"use client";

import { useSession } from "@/hooks/auth/useSession";

export default function AdminButton() {
  const { user } = useSession();

  if (user?.role !== "admin") return null;

  return <button>관리자 기능</button>;
}
```

---

---

## 4. AWS S3 파일 업로드 + CloudFront CDN

### 4-1 아키텍처

```
클라이언트
  ↓ ① Presigned URL 요청
Next.js API Route (/api/upload/presigned)
  ↓ ② Presigned URL 반환 (유효 5분)
클라이언트
  ↓ ③ S3에 직접 PUT 업로드
AWS S3 Bucket
  ↓ (자동)
CloudFront CDN  →  ④ cdnUrl 반환
```

Presigned URL 방식은 Next.js 서버를 파일이 통과하지 않으므로 서버 부하가 없습니다.

### 4-2 클라이언트 업로드 (useUploadS3 훅)

```tsx
"use client";

import { useUploadS3 } from "@/hooks/api/useUploadS3";
import { toast } from "sonner";

export default function ImageUploader() {
  const { mutateAsync: upload, isPending } = useUploadS3();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { cdnUrl } = await upload({
        file,
        options: { folder: "images" }, // S3 키 prefix
      });
      // cdnUrl: https://d1234.cloudfront.net/images/uuid.jpg
      toast.success("업로드 완료!");
      console.log(cdnUrl);
    } catch {
      toast.error("업로드에 실패했습니다.");
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} disabled={isPending} />
      {isPending && <p>업로드 중...</p>}
    </div>
  );
}
```

### 4-3 서버에서 직접 업로드 (API Route)

```ts
// app/api/documents/route.ts
import { uploadToS3 } from "@/service/uploadS3";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { cdnUrl } = await uploadToS3(buffer, file.name, file.type, "documents");
  return Response.json({ url: cdnUrl });
}
```

### 4-4 파일 삭제

```ts
import { deleteFromS3 } from "@/service/uploadS3";

// key: "uploads/uuid.jpg" (CDN URL에서 도메인 제외한 경로)
await deleteFromS3("uploads/uuid.jpg");
```

### 4-5 S3 버킷 CORS 설정 (필수)

Presigned URL 방식 사용 시 S3 버킷에 CORS 설정이 필요합니다.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

---

## 5. Google Sheets 데이터 저장

DB 없이 간단한 데이터(문의, 뉴스레터 구독 등)를 저장할 때 사용합니다.

### 5-1 스프레드시트 준비

1. Google Sheets 새 문서 생성
2. 첫 번째 행(헤더) 입력: `name`, `email`, `message`, `createdAt` 등
3. URL의 `/d/[여기]/edit` 값을 `GOOGLE_SHEET_ID` 환경변수에 저장
4. Google Cloud Console에서 서비스 계정 생성 후 시트에 **편집자** 권한으로 공유

### 5-2 문의 폼 예시 (전체 플로우)

```tsx
// components/content/ContactForm.tsx
"use client";

import { useAppendSheetData } from "@/hooks/api/useAppendSheetData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContactForm() {
  const { mutate: append, isPending } = useAppendSheetData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    append(
      {
        sheetName: "Sheet1",
        data: {
          name: fd.get("name") as string,
          email: fd.get("email") as string,
          message: fd.get("message") as string,
          createdAt: new Date().toLocaleString("ko-KR"),
        },
      },
      {
        onSuccess: () => {
          toast.success("문의가 접수되었습니다. 빠르게 연락드리겠습니다.");
          (e.target as HTMLFormElement).reset();
        },
        onError: () => toast.error("제출에 실패했습니다. 다시 시도해 주세요."),
      }
    );
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>문의하기</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" placeholder="이름" required />
          <Input name="email" type="email" placeholder="이메일" required />
          <Textarea name="message" placeholder="문의 내용" rows={4} required />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "제출 중..." : "문의 보내기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 5-3 서버 컴포넌트에서 데이터 조회

```tsx
// app/admin/contacts/page.tsx
import { getSheetAsObjects } from "@/service/getSheetData";

interface ContactRow {
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default async function ContactsPage() {
  const contacts = await getSheetAsObjects<ContactRow>("Sheet1!A:D");

  return (
    <table>
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>메시지</th>
          <th>날짜</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c, i) => (
          <tr key={i}>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.message}</td>
            <td>{c.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 5-4 Google Sheets vs Prisma 선택 기준

| 상황                                  | 선택                  |
| ------------------------------------- | --------------------- |
| 간단한 문의/구독 폼, DB 불필요 사이트 | **Google Sheets**     |
| 회원, 주문, 관계형 데이터             | **Prisma + Supabase** |
| 비개발자가 데이터 직접 관리           | **Google Sheets**     |
| 대용량 데이터, 복잡한 쿼리            | **Prisma + Supabase** |

---

## 6. 배포

### 6-1 Vercel 배포 (권장)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 연결 & 배포
vercel

# 또는 GitHub 연동 → Vercel 대시보드에서 Import
```

**환경변수 설정**: Vercel 대시보드 → Settings → Environment Variables

> `GOOGLE_PRIVATE_KEY` 입력 시 따옴표 없이 `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----` 형태로 입력합니다 (Vercel이 자동으로 개행 처리).

**주의**: `next.config.ts`의 `output: "standalone"`은 Vercel에서 자동으로 무시됩니다.

---

### 6-2 AWS EC2 + Docker 배포

#### 사전 준비

```bash
# EC2 인스턴스에 Docker 설치 (Amazon Linux 2)
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

#### 로컬에서 이미지 빌드 & ECR 푸시

```bash
# 1. ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.ap-northeast-2.amazonaws.com

# 2. 이미지 빌드
docker build -t uni-boilerplate .

# 3. ECR 태그 & 푸시
docker tag uni-boilerplate:latest [account-id].dkr.ecr.ap-northeast-2.amazonaws.com/uni-boilerplate:latest
docker push [account-id].dkr.ecr.ap-northeast-2.amazonaws.com/uni-boilerplate:latest
```

#### EC2에서 실행

```bash
# 4. EC2에서 이미지 pull & 실행
docker pull [account-id].dkr.ecr.ap-northeast-2.amazonaws.com/uni-boilerplate:latest

docker run -d \
  --name uni-boilerplate \
  -p 3000:3000 \
  --env-file /home/ec2-user/.env.local \
  --restart always \
  [account-id].dkr.ecr.ap-northeast-2.amazonaws.com/uni-boilerplate:latest
```

---

### 6-3 AWS EC2 + PM2 직접 배포 (Docker 없이)

```bash
# EC2에서
git clone [repo-url] app && cd app

# 환경변수 설정
cp .env.example .env.local
nano .env.local  # 값 입력

# 의존성 설치 & 빌드
npm ci
npm run build

# PM2 실행 (ecosystem.config.js 사용)
npm install -g pm2
pm2 start ecosystem.config.js

# 재시작 시 자동 실행 등록
pm2 startup
pm2 save
```

**Nginx 리버스 프록시 설정** (`/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 6-4 Vercel vs AWS 선택 기준

| 항목             | Vercel                | AWS EC2                 |
| ---------------- | --------------------- | ----------------------- |
| 설정 난이도      | 낮음 (Git 연동만)     | 높음 (인프라 직접 관리) |
| 비용             | 무료 ~ $20/월         | EC2 인스턴스 비용       |
| 자동 스케일링    | 자동                  | 직접 설정 필요          |
| 커스텀 서버 설정 | 제한적                | 자유로움                |
| 추천 상황        | 랜딩페이지, 일반 웹앱 | 고트래픽, 특수 요구사항 |

---

---

## 7. 데이터 패칭 패턴

### 7-1 Axios 인스턴스

모든 API 호출은 `@/lib/axios`의 커스텀 인스턴스를 사용합니다.
(`axios` 직접 import 금지 — S3 presigned URL PUT 업로드만 예외)

```ts
// lib/axios.ts — baseURL, 인터셉터 등 공통 설정
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

// 요청 인터셉터 예시 (Authorization 헤더 자동 주입)
axiosInstance.interceptors.request.use((config) => {
  // 필요 시 토큰 주입
  return config;
});

// 응답 인터셉터 예시 (공통 에러 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 7-2 서비스 함수

`service/` 폴더에 Axios 호출을 캡슐화합니다.

```ts
// service/getProducts.ts
import axiosInstance from "@/lib/axios";
import { IProductsResponse } from "@/types/product";

// GET — 목록 조회
export const getProducts = async () => {
  const response = await axiosInstance({ method: "GET", url: "/products" });
  return response.data as IProductsResponse[];
};

// GET — 단건 조회 (파라미터)
export const getProduct = async (id: number) => {
  const response = await axiosInstance({ method: "GET", url: `/products/${id}` });
  return response.data as IProductsResponse;
};

// POST — 생성
export const postProduct = async (data: IProductRequest) => {
  const response = await axiosInstance({ method: "POST", url: "/products", data });
  return response.data as IProductsResponse;
};

// PUT — 수정
export const putProduct = async (id: number, data: IProductRequest) => {
  const response = await axiosInstance({ method: "PUT", url: `/products/${id}`, data });
  return response.data as IProductsResponse;
};

// DELETE — 삭제
export const deleteProduct = async (id: number) => {
  await axiosInstance({ method: "DELETE", url: `/products/${id}` });
};
```

### 7-3 useQuery — 데이터 조회

```ts
// hooks/api/useGetProducts.ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/service/getProducts";

export const useGetProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 유지
  });
};
```

**파라미터가 있는 쿼리:**

```ts
// hooks/api/useGetProduct.ts
export const useGetProduct = (id: number) => {
  return useQuery({
    queryKey: ["products", id], // id가 바뀌면 자동 재조회
    queryFn: () => getProduct(id),
    enabled: !!id, // id가 없으면 실행 안 함
  });
};
```

**컴포넌트에서 사용:**

```tsx
"use client";

import { useGetProducts } from "@/hooks/api/useGetProducts";

export default function ProductList() {
  const { data, isLoading, isError, error } = useGetProducts();

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>오류: {(error as Error).message}</div>;

  return (
    <ul>
      {data?.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### 7-4 useMutation — 데이터 변경

```ts
// hooks/api/usePostProduct.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postProduct } from "@/service/postProduct";
import { toast } from "sonner";

export const usePostProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postProduct,
    onSuccess: () => {
      // 성공 후 목록 쿼리 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("상품이 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "오류가 발생했습니다.");
    },
  });
};
```

**컴포넌트에서 사용:**

```tsx
"use client";

import { usePostProduct } from "@/hooks/api/usePostProduct";

export default function ProductForm() {
  const { mutate: createProduct, isPending } = usePostProduct();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createProduct({ name: fd.get("name") as string });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="상품명" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
```

### 7-5 낙관적 업데이트

서버 응답을 기다리지 않고 UI를 먼저 업데이트해 빠른 반응성을 줍니다.

```ts
// hooks/api/useDeleteProduct.ts
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (deletedId: number) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // 현재 데이터 스냅샷 저장 (롤백용)
      const previous = queryClient.getQueryData<IProductsResponse[]>(["products"]);

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData<IProductsResponse[]>(
        ["products"],
        (old) => old?.filter((p) => p.id !== deletedId) ?? []
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(["products"], context?.previous);
      toast.error("삭제에 실패했습니다.");
    },
    onSettled: () => {
      // 완료 후 서버 데이터로 동기화
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

### 7-6 서버 컴포넌트에서 직접 조회

서버 컴포넌트에서는 React Query 훅 없이 서비스 함수 또는 Prisma를 직접 호출합니다.

```tsx
// app/products/page.tsx (서버 컴포넌트)
import prisma from "@/lib/prisma";

export default async function ProductsPage() {
  // Prisma 직접 호출
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 또는 외부 API 서비스 함수 호출
  // const products = await getProducts();

  return <ProductList initialData={products} />;
}
```

### 7-7 QueryKey 관리 전략

QueryKey가 많아지면 상수로 관리하면 편리합니다.

```ts
// lib/queryKeys.ts
export const queryKeys = {
  products: {
    all: ["products"] as const,
    detail: (id: number) => ["products", id] as const,
    byCategory: (category: string) => ["products", "category", category] as const,
  },
  users: {
    all: ["users"] as const,
    me: ["users", "me"] as const,
  },
};

// 사용 예
queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
```

---

## 8. 폼 처리 (react-hook-form + zod)

### 8-1 기본 패턴

```ts
// types/product.ts — zod 스키마 + TypeScript 타입 함께 관리
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력해 주세요.").max(50, "50자 이하로 입력해 주세요."),
  price: z.coerce.number().min(0, "가격은 0 이상이어야 합니다."),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

```tsx
// components/content/ProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePostProduct } from "@/hooks/api/usePostProduct";

export default function ProductForm() {
  const { mutate: createProduct, isPending } = usePostProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, description: "" },
  });

  const onSubmit = (data: ProductFormData) => {
    createProduct(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품명</FormLabel>
              <FormControl>
                <Input placeholder="상품명을 입력하세요" {...field} />
              </FormControl>
              <FormMessage /> {/* 유효성 검사 오류 자동 표시 */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>가격</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "등록 중..." : "상품 등록"}
        </Button>
      </form>
    </Form>
  );
}
```

### 8-2 자주 쓰는 zod 검증 패턴

```ts
import { z } from "zod";

const formSchema = z
  .object({
    // 문자열
    name: z.string().min(2, "2자 이상 입력해 주세요.").max(20),

    // 이메일
    email: z.string().email("올바른 이메일 형식이 아닙니다."),

    // 비밀번호 (영문+숫자 8자 이상)
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .regex(/[A-Za-z]/, "영문자를 포함해야 합니다.")
      .regex(/[0-9]/, "숫자를 포함해야 합니다."),

    // 비밀번호 확인
    confirmPassword: z.string(),

    // 숫자 (문자열 입력을 숫자로 변환)
    age: z.coerce.number().min(1).max(120),

    // 선택 필드
    phone: z.string().optional(),

    // 빈 문자열 허용 (선택 필드)
    website: z.string().url("올바른 URL 형식이 아닙니다.").or(z.literal("")),

    // 체크박스
    agree: z.boolean().refine((v) => v, "약관에 동의해야 합니다."),
  })
  // 두 필드 간 비교 (refine)
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
```

### 8-3 로그인 폼 (실전 예시)

```tsx
// app/login/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn("credentials", { ...data, redirect: false });

    if (result?.error) {
      // 서버 에러를 특정 필드에 표시
      form.setError("email", { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    toast.success("로그인되었습니다.");
    router.push("/");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="비밀번호 입력" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### 8-4 파일 업로드 폼 (S3 연동)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUploadS3 } from "@/hooks/api/useUploadS3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const uploadSchema = z.object({
  title: z.string().min(1, "제목을 입력해 주세요."),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "이미지를 선택해 주세요.")
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, "5MB 이하 파일만 업로드 가능합니다.")
    .refine(
      (files) => ACCEPTED_TYPES.includes(files[0]?.type),
      "JPG, PNG, WEBP 형식만 지원합니다."
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function ImageUploadForm() {
  const { mutateAsync: upload, isPending: isUploading } = useUploadS3();
  const form = useForm<UploadFormData>({ resolver: zodResolver(uploadSchema) });

  const onSubmit = async (data: UploadFormData) => {
    const file = data.image[0];
    const { cdnUrl } = await upload({ file, options: { folder: "images" } });

    // cdnUrl을 DB에 저장하거나 상태에 반영
    toast.success(`업로드 완료: ${cdnUrl}`);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="이미지 제목" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>이미지</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                  value={undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUploading} className="w-full">
          {isUploading ? "업로드 중..." : "업로드"}
        </Button>
      </form>
    </Form>
  );
}
```

### 8-5 useFormState 활용 (폼 상태 전체 접근)

```tsx
const form = useForm<FormData>({ resolver: zodResolver(schema) });

const {
  formState: {
    errors, // 필드별 에러 객체
    isSubmitting, // 제출 중 여부 (async onSubmit 지원)
    isValid, // 전체 유효성
    isDirty, // 초기값 대비 변경 여부
    dirtyFields, // 변경된 필드 목록
  },
  watch, // 필드 값 실시간 감시
  setValue, // 프로그래밍 방식 값 설정
  trigger, // 특정 필드 수동 검증
  reset, // 폼 초기화
  setError, // 서버 에러 등 외부 에러 주입
} = form;

// 특정 필드 감시
const password = watch("password");

// 프로그래밍 방식으로 값 설정 (예: 외부 데이터 불러오기)
useEffect(() => {
  if (serverData) {
    setValue("name", serverData.name);
    setValue("email", serverData.email);
  }
}, [serverData, setValue]);
```

---

## 9. DB 패턴 — Prisma

Prisma 7 + Supabase PostgreSQL 기준입니다. `lib/prisma.ts`의 싱글턴 `prisma` 인스턴스를 사용합니다.

> **중요**: Prisma 7은 `PrismaPg` 드라이버 어댑터를 사용합니다. `prisma` 인스턴스는 항상 `@/lib/prisma`에서 import합니다.

### 9-1 기본 CRUD

**Create**

```ts
// service/createUser.ts
import prisma from "@/lib/prisma";
import { ICreateUserRequest } from "@/types/user";

export const createUser = async (data: ICreateUserRequest) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "user",
    },
  });
};
```

**Read — 단건 조회**

```ts
// service/getUser.ts
import prisma from "@/lib/prisma";

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// null 대신 에러를 던지고 싶을 때
export const getUserByIdOrThrow = async (id: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id } });
};
```

**Read — 목록 조회**

```ts
// service/getUsers.ts
import prisma from "@/lib/prisma";

export const getUsers = async (role?: string) => {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};
```

**Update**

```ts
// service/updateUser.ts
import prisma from "@/lib/prisma";

export const updateUser = async (id: string, data: { name?: string; role?: string }) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

// upsert: 없으면 생성, 있으면 수정
export const upsertUser = async (email: string, name: string) => {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });
};
```

**Delete**

```ts
// service/deleteUser.ts
import prisma from "@/lib/prisma";

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

// 조건부 일괄 삭제
export const deleteInactiveUsers = async (before: Date) => {
  return prisma.user.deleteMany({
    where: { createdAt: { lt: before } },
  });
};
```

---

### 9-2 관계형 쿼리

**include — 관계 데이터 함께 조회**

```ts
// User와 연결된 Account 함께 가져오기
const userWithAccounts = await prisma.user.findUnique({
  where: { id },
  include: {
    accounts: true,
    sessions: {
      orderBy: { expires: "desc" },
      take: 1, // 최신 세션 1개만
    },
  },
});
```

**중첩 create — 관계 데이터 함께 생성**

```ts
// 게시글 + 태그 함께 생성 (schema에 Post, Tag 모델이 있을 경우)
const post = await prisma.post.create({
  data: {
    title: "제목",
    content: "내용",
    author: {
      connect: { id: userId }, // 기존 User 연결
    },
    tags: {
      create: [{ name: "Next.js" }, { name: "Prisma" }], // 새 Tag 생성
    },
  },
  include: { tags: true },
});
```

**중첩 필터 — 관계 조건으로 부모 조회**

```ts
// 특정 태그를 가진 게시글 조회
const posts = await prisma.post.findMany({
  where: {
    tags: {
      some: { name: "Next.js" }, // 태그 중 하나라도 일치
    },
    author: {
      role: "admin", // 작성자 조건
    },
  },
});
```

---

### 9-3 페이지네이션

**커서 기반 (무한 스크롤 추천)**

```ts
// service/getPosts.ts
import prisma from "@/lib/prisma";

export const getPosts = async (cursor?: string, take = 10) => {
  const posts = await prisma.post.findMany({
    take: take + 1, // 다음 페이지 존재 여부 확인용 1개 초과 조회
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  const hasNextPage = posts.length > take;
  const items = hasNextPage ? posts.slice(0, -1) : posts;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;

  return { items, nextCursor, hasNextPage };
};
```

**오프셋 기반 (페이지 번호 방식)**

```ts
export const getPostsByPage = async (page: number, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count(),
  ]);

  return {
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
};
```

---

### 9-4 트랜잭션

```ts
import prisma from "@/lib/prisma";

// 방법 1: $transaction 배열 (원자적 실행, 순서 보장)
const [updatedUser, newLog] = await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { role: "admin" } }),
  prisma.auditLog.create({ data: { userId: id, action: "PROMOTE" } }),
]);

// 방법 2: 인터랙티브 트랜잭션 (조건부 로직 포함 가능)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUniqueOrThrow({ where: { id } });

  if (user.role === "admin") {
    throw new Error("이미 관리자입니다.");
  }

  await tx.user.update({ where: { id }, data: { role: "admin" } });
  await tx.auditLog.create({ data: { userId: id, action: "PROMOTE" } });
});
```

---

### 9-5 API Route에서 Prisma 사용

```ts
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { name: body.name, role: body.role },
  });

  return NextResponse.json(user);
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
};
```

---

## 10. 상태 관리 — Zustand

클라이언트 전용 전역 상태 관리입니다. **서버 상태(API 데이터)는 React Query**, **UI·세션·설정 등 클라이언트 상태는 Zustand**로 분리합니다.

### 10-1 기본 스토어 패턴

```ts
// store/ui.store.ts
import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setTheme: (theme: UiState["theme"]) => void;
  reset: () => void;
}

const initialState = {
  isSidebarOpen: false,
  theme: "system" as const,
};

export const useUiStore = create<UiState>((set) => ({
  ...initialState,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setTheme: (theme) => set({ theme }),

  reset: () => set(initialState),
}));
```

**컴포넌트에서 사용**

```tsx
"use client";

import { useUiStore } from "@/store/ui.store";

export default function Header() {
  // 필요한 상태만 구독 (불필요한 리렌더링 방지)
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header>
      <button onClick={toggleSidebar}>{isSidebarOpen ? "닫기" : "열기"}</button>
    </header>
  );
}
```

---

### 10-2 비동기 액션 패턴

```ts
// store/notification.store.ts
import { create } from "zustand";
import axiosInstance from "@/lib/axios";

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get<Notification[]>("/notifications");
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.read).length,
        isLoading: false,
      });
    } catch {
      set({ error: "알림을 불러오지 못했습니다.", isLoading: false });
    }
  },

  markAsRead: async (id) => {
    await axiosInstance.patch(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
```

---

### 10-3 persist 미들웨어 (로컬 저장)

새로고침 후에도 상태를 유지해야 할 때 (장바구니, 다크모드, 최근 검색어 등).

```ts
// store/cart.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage", // localStorage 키 이름
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // 저장할 필드만 선택
    }
  )
);
```

> **SSR 주의**: `persist`는 클라이언트 전용입니다. 서버 컴포넌트에서 직접 사용하지 말고, `"use client"` 컴포넌트에서만 호출합니다. hydration 불일치 방지를 위해 초기 렌더링에서 `null`을 반환하는 패턴을 사용합니다.

```tsx
"use client";

import { useCartStore } from "@/store/cart.store";
import { useEffect, useState } from "react";

export default function CartCount() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // hydration 불일치 방지

  return <span>{items.length}</span>;
}
```

---

### 10-4 immer 미들웨어 (불변성 간소화)

중첩 객체 상태를 직접 변경하듯 작성할 수 있습니다.

```bash
npm install immer
```

```ts
// store/editor.store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Block {
  id: string;
  type: "text" | "image" | "video";
  content: string;
}

interface EditorState {
  title: string;
  blocks: Block[];
  selectedId: string | null;
  setTitle: (title: string) => void;
  addBlock: (block: Block) => void;
  updateBlock: (id: string, content: string) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    title: "",
    blocks: [],
    selectedId: null,

    setTitle: (title) =>
      set((state) => {
        state.title = title; // immer 덕분에 직접 변경 가능
      }),

    addBlock: (block) =>
      set((state) => {
        state.blocks.push(block);
      }),

    updateBlock: (id, content) =>
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) block.content = content;
      }),

    removeBlock: (id) =>
      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== id);
      }),

    selectBlock: (id) =>
      set((state) => {
        state.selectedId = id;
      }),
  }))
);
```

---

### 10-5 스토어 조합 패턴

여러 스토어를 한 컴포넌트에서 사용할 때 필요한 상태만 구독합니다.

```tsx
"use client";

import { useUiStore } from "@/store/ui.store";
import { useCartStore } from "@/store/cart.store";
import { useSession } from "@/hooks/auth/useSession";

export default function AppHeader() {
  // 각 스토어에서 필요한 것만 선택 구독
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const cartCount = useCartStore((s) => s.items.length);
  const { user, isAuthenticated } = useSession();

  return (
    <header>
      <button onClick={toggleSidebar}>{isSidebarOpen ? "닫기" : "열기"}</button>
      <span>장바구니 {cartCount}개</span>
      {isAuthenticated && <span>{user?.name}</span>}
    </header>
  );
}
```

**스토어 간 의존성이 필요할 때** — 직접 import 대신 이벤트 기반으로 분리합니다.

```ts
// store/auth.store.ts
import { create } from "zustand";
import { useCartStore } from "./cart.store";

interface AuthState {
  logout: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  logout: () => {
    // 로그아웃 시 장바구니도 함께 초기화
    useCartStore.getState().clearCart();
  },
}));
```

---

### 10-6 React Query와 함께 사용

**원칙**: 서버 데이터는 React Query, UI·사용자 선택·일시적 상태는 Zustand.

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "@/store/ui.store";
import axiosInstance from "@/lib/axios";

// 잘못된 패턴 ❌ — API 응답을 Zustand에 저장
const useProductsWrong = () => {
  const setProducts = useProductStore((s) => s.setProducts);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);
};

// 올바른 패턴 ✅ — 서버 상태는 React Query
const useProductsWithFilter = () => {
  const selectedCategory = useUiStore((s) => s.selectedCategory); // Zustand: UI 상태

  return useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/products", {
        params: { category: selectedCategory },
      });
      return data;
    },
  });
};
```

**선택 상태와 목록 데이터 분리 예시**

```ts
// store/product.store.ts — 선택/필터 UI 상태만 관리
import { create } from "zustand";

interface ProductUiState {
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: "grid" | "list";
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export const useProductStore = create<ProductUiState>((set) => ({
  selectedCategory: null,
  searchQuery: "",
  viewMode: "grid",
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
```

```tsx
// components/content/ProductList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useProductStore } from "@/store/product.store";
import axiosInstance from "@/lib/axios";

export default function ProductList() {
  const { selectedCategory, searchQuery } = useProductStore();

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, searchQuery],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/products", {
        params: { category: selectedCategory, q: searchQuery },
      });
      return data;
    },
    staleTime: 1000 * 30, // 30초
  });

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <ul>
      {data?.map((product: { id: string; name: string }) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```
