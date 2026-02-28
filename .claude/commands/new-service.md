# 새 서비스 + API 훅 쌍 생성

인자: `$ARGUMENTS` (형식: `method ResourceName [설명]`)

예시:

- `/project:new-service get Contact 문의 목록 조회`
- `/project:new-service post Contact 문의 제출`
- `/project:new-service put User 유저 정보 수정`
- `/project:new-service delete Post 포스트 삭제`

---

서비스 함수(`service/`)와 대응되는 React Query 훅(`hooks/api/`)을 함께 생성합니다.

## 처리 단계

1. `$ARGUMENTS`를 파싱합니다:
   - `method`: `get` | `post` | `put` | `patch` | `delete`
   - `ResourceName`: 리소스 이름 (PascalCase)
   - 나머지: 설명

2. 이름 생성 규칙:
   - 서비스 함수명: `{method}{ResourceName}` (camelCase) → `getContact`, `postContact`
   - 서비스 파일: `service/{method}{ResourceName}.ts`
   - 훅 이름: `use{Method}{ResourceName}` → `useGetContact`, `usePostContact`
   - 훅 파일: `hooks/api/use{Method}{ResourceName}.ts`
   - 타입 인터페이스: `I{ResourceName}Response` / `I{ResourceName}Request`
   - QueryKey: `['{resourceName}']` (소문자)

3. 아래 템플릿으로 파일을 생성합니다.

## GET 서비스 템플릿

```ts
// service/get{ResourceName}.ts
import axiosInstance from "@/lib/axios"
import { I{ResourceName}Response } from "@/types/{resourceName}"

export const get{ResourceName} = async () => {
  const response = await axiosInstance({
    method: 'GET',
    url: '/{resourceName}',
  })
  return response.data as I{ResourceName}Response
}
```

## GET 훅 템플릿

```ts
// hooks/api/useGet{ResourceName}.ts
import { get{ResourceName} } from "@/service/get{ResourceName}"
import { useQuery } from "@tanstack/react-query"

export const useGet{ResourceName} = () => {
  return useQuery({
    queryKey: ['{resourceName}'],
    queryFn: async () => await get{ResourceName}()
  })
}
```

## POST/PUT/PATCH 서비스 템플릿

```ts
// service/post{ResourceName}.ts
import axiosInstance from "@/lib/axios"
import { I{ResourceName}Request, I{ResourceName}Response } from "@/types/{resourceName}"

export const post{ResourceName} = async (data: I{ResourceName}Request) => {
  const response = await axiosInstance({
    method: 'POST',
    url: '/{resourceName}',
    data,
  })
  return response.data as I{ResourceName}Response
}
```

## POST/PUT/PATCH 훅 템플릿

```ts
// hooks/api/usePost{ResourceName}.ts
import { post{ResourceName} } from "@/service/post{ResourceName}"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const usePost{ResourceName} = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: post{ResourceName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{resourceName}'] })
    },
  })
}
```

## 타입 파일도 함께 생성

`types/{resourceName}.ts`가 존재하지 않으면 생성합니다:

```ts
// types/{resourceName}.ts
export interface I{ResourceName}Response {
  id: number
  // TODO: 필드 추가
}

export interface I{ResourceName}Request {
  // TODO: 요청 필드 추가
}
```

## 인증 헤더가 필요한 서비스 (옵션)

클라이언트 사이드에서 Authorization 헤더가 필요할 때:

```ts
// service/getProtectedResource.ts
import axiosInstance from "@/lib/axios";
import { IResourceResponse } from "@/types/resource";

export const getProtectedResource = async (token: string) => {
  const response = await axiosInstance({
    method: "GET",
    url: "/protected/resource",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data as IResourceResponse;
};
```

- 생성 후 파일 목록과 타입 수정 방법을 안내합니다.
