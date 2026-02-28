# 새 커스텀 훅 생성

인자: `$ARGUMENTS` (형식: `hookName [설명]`)

예시:

- `/project:new-hook useModal`
- `/project:new-hook useLocalStorage 로컬스토리지 상태 관리`
- `/project:new-hook useDebounce 디바운스 처리`

---

React 커스텀 훅을 생성합니다.

## 처리 단계

1. `$ARGUMENTS`에서 훅 이름과 설명을 파싱합니다.
   - 이름이 `use`로 시작하지 않으면 자동으로 `use` 접두사를 추가합니다.

2. 훅의 성격을 파악합니다:
   - API 관련 훅 → `hooks/api/{hookName}.ts`
   - 일반 커스텀 훅 → `hooks/{hookName}.ts`

3. 아래 템플릿으로 파일을 생성합니다.

## 일반 훅 템플릿

```ts
// hooks/{hookName}.ts
import { useState, useCallback } from "react";

export const {
  hookName,
} = () => {
  // TODO: 상태 정의
  const [state, setState] = useState(null);

  // TODO: 핸들러 정의
  const handle = useCallback(() => {
    // ...
  }, []);

  return { state, handle };
};
```

## API 훅 템플릿 (useGet~, usePost~ 등)

```ts
// hooks/api/{hookName}.ts
import { {serviceFn} } from "@/service/{serviceName}"
import { useQuery } from "@tanstack/react-query"

export const {hookName} = () => {
  return useQuery({
    queryKey: ['{queryKey}'],
    queryFn: async () => await {serviceFn}()
  })
}
```

## Mutation 훅 템플릿

```ts
// hooks/api/{hookName}.ts
import { {serviceFn} } from "@/service/{serviceName}"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const {hookName} = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: {serviceFn},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{relatedQueryKey}'] })
    },
  })
}
```

- 설명을 분석하여 가장 적합한 템플릿을 선택합니다.
- 생성 후 사용 예시 코드도 함께 제공합니다.
