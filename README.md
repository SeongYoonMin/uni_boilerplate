# 🚀 Uni Boilerplate

외주 랜딩페이지 제작을 위한 Next.js 기반 보일러플레이트

## 프로젝트 개요
- ✅ Next.js 16 (App Router)
- ✅ TypeScript
- ✅ TailwindCSS 4
- ✅ React Query (서버 상태)
- ✅ Zustand (클라이언트 상태)

<br/>

## 기술 스택

- **Framework**: Next.js 16.1.4
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **Server State**: TanStack Query v5
- **Client State**: Zustand v5
- **HTTP Client**: Axios v1.13

<br/>

## 프로젝트 구조

```
uni_boilerplate/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/               # API Routes
│   └── globals.css
│
├── components/
│   ├── common/            # 공통 컴포넌트 (Button, Input 등)
│   ├── container/         # 레이아웃 컨테이너 (Section, Grid)
│   └── content/           # 콘텐츠 컴포넌트 (HeroSection 등)
│
├── hooks/
│   ├── api/               # API 관련 훅
│   └── ...                # 기타 커스텀 훅
│
├── provider/              # Context Providers
│   ├── QueryProvider.tsx  # React Query Provider
│   └── ThemeProvider.tsx  # Theme Provider
│
├── service/               # API 통신 & 비즈니스 로직
│   ├── api.ts
│   └── ...Service.ts
│
├── store/                 # Zustand 스토어
│   └── ...Store.ts
│
├── lib/                   # 헬퍼 함수
│   ├── utils.ts
│   └── constants.ts
│
├── util/                  # 유틸리티 함수
│   ├── format.ts
│   └── validate.ts
│
├── types/                 # TypeScript 타입
│   └── index.ts
│
├── public/                # 정적 파일
│   ├── images/
│   └── fonts/
│
└── scripts/               # 배포/빌드 스크립트
```
<br/>

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.local 생성)
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. 개발 서버 실행
npm run dev
```
<br/>

## 폴더별 역할

| 폴더 | 역할 |
|------|------|
| `app/` | 라우팅, 페이지, 레이아웃 |
| `components/common/` | 재사용 가능한 UI 컴포넌트 |
| `components/container/` | 레이아웃 컴포넌트 |
| `components/content/` | 페이지별 콘텐츠 컴포넌트 |
| `hooks/` | Custom React Hooks |
| `hooks/api/` | API 통신 관련 훅 |
| `provider/` | Context Providers |
| `service/` | API 클라이언트 & 비즈니스 로직 |
| `store/` | Zustand 전역 상태 |
| `lib/` | 공통 헬퍼 함수 |
| `util/` | 유틸리티 함수 |
| `types/` | TypeScript 타입 정의 |

<br/>

## 주요 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 검사
```


