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

- 메인 페이지 구성
- Auth 플로우 (로그인, 회원가입, 세션, RBAC)
- S3 파일 업로드 + CloudFront CDN
- Google Sheets 데이터 처리
- Vercel / AWS 배포

Claude Code 슬래시 커맨드:

| 커맨드                       | 설명                            |
| ---------------------------- | ------------------------------- |
| `/project:new-component`     | 컴포넌트 생성                   |
| `/project:new-page`          | 페이지 + 레이아웃 생성          |
| `/project:new-service`       | 서비스 + React Query 훅 쌍 생성 |
| `/project:new-store`         | Zustand 스토어 생성             |
| `/project:new-auth-page`     | 로그인 / 회원가입 페이지 생성   |
| `/project:new-sheet-service` | Google Sheets 서비스 + 폼 생성  |
| `/project:review`            | 변경사항 코드 리뷰              |
