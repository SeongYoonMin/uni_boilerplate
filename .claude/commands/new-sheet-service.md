# Google Sheets 서비스 + 폼 생성

인자: `$ARGUMENTS` (형식: `SheetName [헤더1,헤더2,...]`)

예시:

- `/project:new-sheet-service Contact name,email,message` — 문의 시트
- `/project:new-sheet-service Newsletter email,name,createdAt` — 뉴스레터 구독

---

Google Sheets를 데이터 저장소로 사용하는 서비스와 폼 컴포넌트를 생성합니다.

## 처리 단계

1. `$ARGUMENTS` 파싱: `SheetName`과 헤더 목록 추출
2. 아래 파일들을 생성합니다.

## 생성 파일

```
types/{sheetName}.ts                     ← 시트 행 타입
app/api/sheet/{sheetName}/route.ts       ← 전용 API Route (이미 있으면 스킵)
components/content/{SheetName}Form.tsx   ← 제출 폼 컴포넌트
```

## 타입 템플릿

```ts
// types/{sheetName}.ts
export interface I{SheetName}Row {
  {header1}: string;
  {header2}: string;
  // ...헤더에 따라 생성
}
```

## 폼 템플릿

```tsx
// components/content/{SheetName}Form.tsx
"use client";

import { useAppendSheetData } from "@/hooks/api/useAppendSheetData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function {SheetName}Form() {
  const { mutate: append, isPending } = useAppendSheetData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    append(
      {
        sheetName: "{SheetName}",
        data: {
          // 헤더에 따라 자동 생성
          {header1}: fd.get("{header1}") as string,
          {header2}: fd.get("{header2}") as string,
          createdAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("제출되었습니다.");
          e.currentTarget.reset();
        },
        onError: () => toast.error("제출에 실패했습니다. 다시 시도해 주세요."),
      }
    );
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{SheetName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 헤더에 따라 Input 자동 생성 */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "제출 중..." : "제출"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## 생성 후 안내

- 스프레드시트 첫 번째 행(A1~)에 헤더를 직접 입력하세요: `{header1}`, `{header2}`, ...
- 서비스 계정(`GOOGLE_SERVICE_ACCOUNT_EMAIL`)을 시트에 편집자로 공유하세요.
- 환경변수 `GOOGLE_SHEET_ID`가 `.env.local`에 설정되어 있어야 합니다.
