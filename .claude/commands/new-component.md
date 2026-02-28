# 새 컴포넌트 생성

인자: `$ARGUMENTS` (형식: `[위치/]ComponentName [설명]`)

예시:

- `/project:new-component Button 클릭 가능한 버튼`
- `/project:new-component common/Modal 모달 다이얼로그`
- `/project:new-component content/HeroSection 메인 히어로 섹션`

---

다음 규칙에 따라 컴포넌트를 생성하세요.

## 처리 단계

1. `$ARGUMENTS`를 파싱합니다.
   - 첫 번째 토큰: `[위치/]ComponentName` (슬래시가 없으면 `components/common/`에 생성)
   - 나머지 토큰: 컴포넌트 설명 (없으면 이름 기반으로 추론)

2. 위치 결정:
   - `common/Foo` → `components/common/Foo.tsx`
   - `container/Foo` → `components/container/Foo.tsx`
   - `content/Foo` → `components/content/Foo.tsx`
   - `Foo` (위치 없음) → `components/common/Foo.tsx`

3. 이미 파일이 존재하면 사용자에게 알리고 덮어쓸지 확인합니다.

4. 아래 템플릿으로 파일을 생성합니다.

## 파일 템플릿

```tsx
import React from 'react'

interface {ComponentName}Props {
  // TODO: props 정의
}

const {ComponentName} = ({}: {ComponentName}Props) => {
  return (
    <div>
      {/* {ComponentName} */}
    </div>
  )
}

export default {ComponentName}
```

- props가 필요 없는 경우 `interface`와 props 파라미터를 제거합니다.
- 클라이언트 상태(useState, useEffect 등)가 필요한 경우 상단에 `"use client"` 추가합니다.
- TailwindCSS 클래스를 사용합니다.
- 생성 후 파일 경로와 다음 단계(props 수정, 스타일링 등)를 안내합니다.
