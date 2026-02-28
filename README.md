# Uni Boilerplate

외주 랜딩페이지 제작을 위한 Next.js 풀스택 보일러플레이트.
인증·DB·파일 스토리지·UI 라이브러리를 미리 통합해 매 프로젝트마다 반복 설치 없이 바로 시작할 수 있습니다.

---

## 기술 스택

| 분류                | 라이브러리                  | 버전    |
| ------------------- | --------------------------- | ------- |
| Framework           | Next.js (App Router)        | 16.1.4  |
| Language            | TypeScript                  | 5       |
| Styling             | TailwindCSS + shadcn/ui     | 4       |
| 인증                | Auth.js (next-auth)         | v5 beta |
| ORM                 | Prisma                      | 7       |
| DB                  | Supabase PostgreSQL         | -       |
| 파일 스토리지       | AWS S3 + CloudFront CDN     | -       |
| DB 없는 데이터 저장 | Google Sheets API           | -       |
| Server State        | TanStack Query              | v5      |
| Client State        | Zustand                     | v5      |
| HTTP Client         | Axios                       | v1.13   |
| 코드 품질           | ESLint + Prettier           | -       |
| 배포                | Vercel / AWS (Docker + PM2) | -       |

---

## 새 프로젝트에서 사용하는 방법

### 방법 1: GitHub Template (권장)

**1회 설정** — GitHub 레포 → **Settings** → **"Template repository"** 체크박스 활성화

이후 새 프로젝트를 시작할 때마다:

1. 레포 페이지 → **"Use this template"** → **"Create a new repository"**
2. 레포 이름 입력 후 생성 (git 히스토리가 초기화된 새 레포가 만들어집니다)
3. 로컬에 clone

```bash
git clone https://github.com/{계정}/{새프로젝트}.git
cd {새프로젝트}
```

### 방법 2: degit

GitHub 연동 없이 로컬에서 바로 시작할 때.

```bash
npx degit SeongYoonMin/uni_boilerplate {새프로젝트명}
cd {새프로젝트명}
git init && git add . && git commit -m "init"
```

### 방법 3: clone + 히스토리 초기화

```bash
git clone https://github.com/SeongYoonMin/uni_boilerplate.git {새프로젝트명}
cd {새프로젝트명}
rm -rf .git
git init && git add . && git commit -m "init"
# GitHub에서 새 레포 생성 후
git remote add origin https://github.com/{계정}/{새프로젝트명}.git
git push -u origin main
```

---

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local을 열고 필요한 값을 입력하세요
```

| 그룹          | 필수 변수                                                                                                 | 비고                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| DB            | `DATABASE_URL`, `DATABASE_DIRECT_URL`                                                                     | Supabase Dashboard → Settings → Database |
| Supabase      | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`                  | Supabase Dashboard → Settings → API      |
| Auth          | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                                                     | `npx auth secret`으로 AUTH_SECRET 생성   |
| AWS S3        | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_CLOUDFRONT_DOMAIN` | S3 미사용 시 생략 가능                   |
| Google Sheets | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`                                   | Sheets 미사용 시 생략 가능               |

### 3. DB 스키마 적용

```bash
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

---

## 프로젝트 구조

```
uni_boilerplate/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Auth.js 핸들러
│   │   ├── upload/presigned/       # S3 Presigned URL 발급
│   │   └── sheet/[sheetName]/      # Google Sheets CRUD
│   ├── layout.tsx                  # RootProvider, Header/Footer
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── common/        # 커스텀 재사용 UI
│   ├── container/     # 레이아웃 래퍼
│   ├── content/       # 페이지별 콘텐츠
│   └── ui/            # shadcn/ui 자동생성 ← 수정 가능
│
├── hooks/
│   ├── api/           # useQuery / useMutation 훅
│   │   ├── useUploadS3.ts       # S3 파일 업로드
│   │   ├── useGetSheetData.ts   # Sheets 조회
│   │   └── useAppendSheetData.ts # Sheets 행 추가
│   └── auth/
│       └── useSession.ts
│
├── lib/
│   ├── auth.ts         # Auth.js v5 설정
│   ├── axios.ts        # Axios 인스턴스
│   ├── prisma.ts       # PrismaClient 싱글턴
│   ├── s3.ts           # S3 클라이언트 + CDN 헬퍼
│   ├── supabase.ts     # Supabase 클라이언트
│   ├── googleSheets.ts # Google Sheets API
│   ├── utils.ts        # cn() 헬퍼
│   └── generated/      # Prisma 자동생성 ← 수정 금지
│
├── service/
│   ├── uploadS3.ts       # S3 업로드, Presigned URL, 삭제
│   ├── getSheetData.ts   # Sheets 조회
│   └── appendSheetData.ts # Sheets 행 추가
│
├── middleware.ts          # 보호 라우트 처리
├── prisma/schema.prisma   # DB 스키마
├── provider/              # RootProvider, AuthProvider, QueryProvider
├── store/                 # Zustand 스토어
├── types/                 # TypeScript 타입
│
├── Dockerfile             # AWS Docker 배포
├── .dockerignore
├── ecosystem.config.js    # PM2 (EC2 직접 배포)
└── .env.example           # 환경변수 템플릿
```

---

## 주요 기능

### AWS S3 + CloudFront 파일 업로드

Presigned URL 방식으로 클라이언트가 S3에 직접 업로드합니다 (서버 부하 없음).

```tsx
import { useUploadS3 } from "@/hooks/api/useUploadS3";

const { mutateAsync: upload } = useUploadS3();
const { cdnUrl } = await upload({ file, options: { folder: "images" } });
// cdnUrl: https://d1234.cloudfront.net/images/uuid.jpg
```

### Google Sheets 데이터 저장

DB 없이 문의, 뉴스레터 구독 등을 Google Sheets에 저장합니다.

```tsx
import { useAppendSheetData } from "@/hooks/api/useAppendSheetData";

const { mutate: append } = useAppendSheetData();
append({ sheetName: "Sheet1", data: { name: "홍길동", email: "hong@example.com" } });
```

### 인증 (Auth.js v5)

Google OAuth + 이메일/비밀번호 로그인, JWT 전략.

```ts
// 서버
const session = await auth(); // session.user.id, session.user.role

// 클라이언트
const { user, isAuthenticated, login, logout } = useSession();
```

---

## 주요 명령어

### 개발

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 전체 포맷
```

### Prisma

```bash
npx prisma db push              # 스키마 → DB 동기화
npx prisma migrate dev          # 마이그레이션 생성 + 적용 *
npx prisma studio               # DB GUI 브라우저
```

> `*` migrate dev 실행 시 `prisma.config.ts`의 `url`을 `DATABASE_DIRECT_URL` 값으로 교체 후 실행 (Supabase pgBouncer는 마이그레이션 불가).

---

## 배포

### Vercel (권장)

```bash
npm i -g vercel && vercel
# 또는 GitHub 연동 후 Vercel 대시보드에서 Import
```

환경변수는 Vercel 대시보드 → **Settings → Environment Variables** 에서 설정합니다.

### AWS EC2 + Docker

```bash
# 이미지 빌드
docker build -t uni-boilerplate .

# 실행 (환경변수 파일 지정)
docker run -d -p 3000:3000 --env-file .env.local --restart always uni-boilerplate
```

### AWS EC2 + PM2

```bash
npm ci && npm run build
pm2 start ecosystem.config.js && pm2 save
```

자세한 배포 가이드는 **`SKILL.md` → 6. 배포** 섹션을 참고하세요.

---

## shadcn/ui 컴포넌트

기본 포함: `Button` `Input` `Form` `Card` `Dialog` `Sheet` `Drawer` `Avatar` `Badge` `Label` `Sonner`

```bash
npx shadcn@latest add [component-name]  # 추가 설치
```

---

## 개발 가이드

자세한 패턴과 예시 코드는 **`SKILL.md`** 를 참고하세요.

| #   | 섹션             | 주요 내용                                        |
| --- | ---------------- | ------------------------------------------------ |
| 1   | 환경 설정        | 첫 시작, 유용한 명령어, Supabase 연결            |
| 2   | 메인 페이지 구성 | 페이지·레이아웃 구조, shadcn/ui 활용             |
| 3   | Auth 플로우      | 로그인, 회원가입, 세션 사용, 보호 라우트, RBAC   |
| 4   | AWS S3 & CDN     | Presigned URL 업로드, 서버 업로드, 삭제          |
| 5   | Google Sheets    | 데이터 조회·추가, API Route 활용                 |
| 6   | 배포             | Vercel, AWS Docker, PM2, 환경변수 설정           |
| 7   | 데이터 패칭      | Axios, useQuery, useMutation, Optimistic Update  |
| 8   | 폼 처리          | react-hook-form + zod, 파일 업로드 폼            |
| 9   | DB 패턴          | Prisma CRUD, 관계형 쿼리, 페이지네이션, 트랜잭션 |
| 10  | 상태 관리        | Zustand 스토어, persist, immer, React Query 연동 |

---

## Claude Code 설정

이 보일러플레이트는 Claude Code(AI 코딩 어시스턴트)와의 협업을 위한 설정이 포함되어 있습니다.

```
CLAUDE.md                        ← 프로젝트 컨텍스트 (스택·컨벤션·패턴)
.claude/
  commands/                      ← 슬래시 커맨드 (코드 생성 자동화)
  agents/                        ← 서브에이전트 (작업별 전문 AI)
```

---

### 슬래시 커맨드

Claude Code 채팅창에서 `/project:커맨드명 인자` 형식으로 실행합니다.

#### `/project:new-component` — 컴포넌트 생성

```
/project:new-component [위치/]ComponentName [설명]
```

| 예시                                                     | 생성 파일                            |
| -------------------------------------------------------- | ------------------------------------ |
| `/project:new-component Button`                          | `components/common/Button.tsx`       |
| `/project:new-component common/Modal 모달 다이얼로그`    | `components/common/Modal.tsx`        |
| `/project:new-component content/HeroSection 메인 히어로` | `components/content/HeroSection.tsx` |

위치를 생략하면 `components/common/`에 생성됩니다.

---

#### `/project:new-page` — 페이지 생성

```
/project:new-page route-path [설명]
```

| 예시                                        | 생성 파일                                |
| ------------------------------------------- | ---------------------------------------- |
| `/project:new-page about`                   | `app/about/page.tsx`                     |
| `/project:new-page contact 문의 페이지`     | `app/contact/page.tsx` + `layout.tsx`    |
| `/project:new-page blog/[slug] 블로그 상세` | `app/blog/[slug]/page.tsx` (동적 라우트) |

---

#### `/project:new-service` — 서비스 + React Query 훅 쌍 생성

```
/project:new-service method ResourceName [설명]
```

`method`는 `get` | `post` | `put` | `patch` | `delete`.

| 예시                                          | 생성 파일                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| `/project:new-service get Contact`            | `service/getContact.ts` + `hooks/api/useGetContact.ts` + `types/contact.ts` |
| `/project:new-service post Contact 문의 제출` | `service/postContact.ts` + `hooks/api/usePostContact.ts`                    |

GET은 `useQuery`, 나머지는 `useMutation` + `invalidateQueries` 패턴으로 생성됩니다.

---

#### `/project:new-hook` — 커스텀 훅 생성

```
/project:new-hook hookName [설명]
```

| 예시                                          | 생성 파일              |
| --------------------------------------------- | ---------------------- |
| `/project:new-hook useModal`                  | `hooks/useModal.ts`    |
| `/project:new-hook useDebounce 디바운스 처리` | `hooks/useDebounce.ts` |

API 관련 훅(useGet~, usePost~)은 `hooks/api/`에, 일반 훅은 `hooks/`에 생성됩니다.

---

#### `/project:new-store` — Zustand 스토어 생성

```
/project:new-store storeName [설명]
```

| 예시                                       | 생성 파일                                     |
| ------------------------------------------ | --------------------------------------------- |
| `/project:new-store cart`                  | `store/cart.store.ts`                         |
| `/project:new-store user 로그인 상태 유지` | `store/user.store.ts` (persist 미들웨어 포함) |

"로그인 상태 유지", "새로고침 후에도 유지" 등의 설명이 있으면 `persist` 미들웨어가 자동 적용됩니다.

---

#### `/project:new-auth-page` — 인증 페이지 생성

```
/project:new-auth-page login | signup | both
```

| 예시                            | 생성 파일                                           |
| ------------------------------- | --------------------------------------------------- |
| `/project:new-auth-page login`  | `app/login/page.tsx` + `app/login/LoginForm.tsx`    |
| `/project:new-auth-page signup` | `app/signup/page.tsx` + `app/signup/SignupForm.tsx` |
| `/project:new-auth-page both`   | 로그인 + 회원가입 모두 생성                         |

Google OAuth 버튼 + 이메일/비밀번호 폼이 포함된 shadcn/ui 기반 카드 레이아웃으로 생성됩니다.

---

#### `/project:new-sheet-service` — Google Sheets 서비스 + 폼 생성

```
/project:new-sheet-service SheetName 헤더1,헤더2,...
```

| 예시                                                    | 생성 파일                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `/project:new-sheet-service Contact name,email,message` | `types/contact.ts` + `components/content/ContactForm.tsx`       |
| `/project:new-sheet-service Newsletter email,createdAt` | `types/newsletter.ts` + `components/content/NewsletterForm.tsx` |

스프레드시트 첫 번째 행 헤더 순서와 인자의 헤더 순서를 일치시켜야 합니다.

---

#### `/project:review` — 코드 리뷰

```
/project:review                              # git 변경사항 전체 리뷰
/project:review components/common/Button.tsx # 특정 파일 리뷰
```

프로젝트 컨벤션(파일 위치, 네이밍, `use client` 여부, Axios 인스턴스, 타입 정의, 보안 등)을 기준으로 리뷰 결과를 ✅ / ⚠️ / 🔴 형식으로 출력합니다.

---

### 서브에이전트

Claude Code가 복잡한 작업을 할 때 자동으로 호출하는 전문 에이전트입니다. 직접 호출할 수도 있습니다.

| 에이전트             | 파일                                   | 언제 사용                                                   |
| -------------------- | -------------------------------------- | ----------------------------------------------------------- |
| `component-builder`  | `.claude/agents/component-builder.md`  | UI 컴포넌트 생성·수정, TailwindCSS 스타일링, shadcn/ui 활용 |
| `api-integrator`     | `.claude/agents/api-integrator.md`     | 서비스 함수, React Query 훅, Zustand 연결, 데이터 흐름 전반 |
| `auth-specialist`    | `.claude/agents/auth-specialist.md`    | Auth.js v5, 세션 처리, 보호 라우트, JWT 콜백, RBAC          |
| `storage-specialist` | `.claude/agents/storage-specialist.md` | AWS S3 업로드, CloudFront CDN, Google Sheets CRUD           |
| `type-definer`       | `.claude/agents/type-definer.md`       | TypeScript 타입·인터페이스 정의, API 응답 타입 추론         |

**예시 — 직접 에이전트 지정:**

```
"api-integrator를 사용해서 상품 목록 조회 기능 구현해줘"
"storage-specialist로 이미지 업로드 폼 만들어줘"
```
