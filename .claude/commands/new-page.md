# 새 페이지 생성

인자: `$ARGUMENTS` (형식: `route-path [설명]`)

예시:

- `/project:new-page about`
- `/project:new-page contact 문의 페이지`
- `/project:new-page blog/[slug] 블로그 상세 페이지`

---

Next.js App Router 방식으로 페이지를 생성합니다.

## 처리 단계

1. `$ARGUMENTS`에서 라우트 경로와 설명을 파싱합니다.

2. 생성할 파일 목록:
   - `app/{route}/page.tsx` — 페이지 컴포넌트
   - `app/{route}/layout.tsx` — (선택) 해당 라우트에 레이아웃이 필요한 경우

3. 이미 존재하는 파일이 있으면 사용자에게 알립니다.

4. 아래 템플릿으로 파일을 생성합니다.

## page.tsx 템플릿

```tsx
// app/{route}/page.tsx

export default function {PageName}Page() {
  return (
    <main>
      <h1>{PageName}</h1>
    </main>
  )
}
```

## layout.tsx 템플릿 (필요한 경우)

```tsx
// app/{route}/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{PageName}',
  description: '{설명}',
}

export default function {PageName}Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

## 동적 라우트 ([slug]) page.tsx 템플릿

```tsx
// app/{route}/[slug]/page.tsx

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function {PageName}Page({ params }: PageProps) {
  const { slug } = await params
  return (
    <main>
      <h1>{slug}</h1>
    </main>
  )
}
```

- 생성 후 파일 경로와 접속 URL을 안내합니다.
- 필요한 경우 관련 컴포넌트 생성 방법도 함께 안내합니다.
