# 새 Zustand 스토어 생성

인자: `$ARGUMENTS` (형식: `storeName [설명]`)

예시:

- `/project:new-store cart`
- `/project:new-store user 유저 정보 전역 상태`
- `/project:new-store modal 모달 열림/닫힘 상태`

---

Zustand 스토어 파일을 생성합니다.

## 처리 단계

1. `$ARGUMENTS`에서 스토어 이름과 설명을 파싱합니다.
   - 이름에서 `.store` 접미사가 없으면 자동 추가
   - 파일명: `store/{storeName}.store.ts`
   - 훅명: `use{StoreName}Store` (PascalCase)

2. 설명을 분석하여 기본 상태 필드를 추론합니다.

3. 아래 템플릿으로 파일을 생성합니다.

## 기본 스토어 템플릿

```ts
// store/{storeName}.store.ts
import { create } from 'zustand'

interface {StoreName}State {
  // TODO: 상태 필드 정의
  value: string | null
  set{StoreName}: (value: string) => void
  clear{StoreName}: () => void
}

export const use{StoreName}Store = create<{StoreName}State>((set) => ({
  value: null,
  set{StoreName}: (value) => set({ value }),
  clear{StoreName}: () => set({ value: null }),
}))
```

## persist 미들웨어 포함 템플릿 (localStorage 유지가 필요한 경우)

```ts
// store/{storeName}.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface {StoreName}State {
  // TODO: 상태 필드 정의
  value: string | null
  setValue: (value: string) => void
  clearValue: () => void
}

export const use{StoreName}Store = create<{StoreName}State>()(
  persist(
    (set) => ({
      value: null,
      setValue: (value) => set({ value }),
      clearValue: () => set({ value: null }),
    }),
    { name: '{storeName}-storage' }
  )
)
```

- "로그인 상태 유지", "새로고침 후에도 유지" 같은 설명이 있으면 persist 템플릿을 사용합니다.
- 생성 후 상태 필드 수정 방법과 컴포넌트에서의 사용 예시를 제공합니다.
