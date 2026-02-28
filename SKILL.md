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

## 추가 예정

- `7. 데이터 패칭 패턴` — Axios 서비스, React Query 훅, 낙관적 업데이트
- `8. 폼 처리` — react-hook-form + zod 유효성 검사
- `9. DB 패턴` — Prisma CRUD, 관계형 쿼리
- `10. 상태 관리` — Zustand 스토어 패턴
