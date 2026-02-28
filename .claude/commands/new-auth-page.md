# 로그인/회원가입 페이지 생성

인자: `$ARGUMENTS` (형식: `login | signup | both`)

예시:

- `/project:new-auth-page login` — 로그인 페이지만
- `/project:new-auth-page signup` — 회원가입 페이지만
- `/project:new-auth-page both` — 둘 다 생성

---

Auth.js v5 기반 인증 페이지를 생성합니다.

## 처리 단계

1. `$ARGUMENTS`를 파싱합니다 (`login` | `signup` | `both`)
2. 아래 템플릿 기준으로 파일을 생성합니다.

## 로그인 페이지 템플릿

```
app/login/page.tsx        ← 서버 컴포넌트 (메타데이터)
app/login/LoginForm.tsx   ← 클라이언트 컴포넌트 (폼)
```

### `app/login/page.tsx`

```tsx
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  );
}
```

### `app/login/LoginForm.tsx`

```tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginForm() {
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
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="이메일" required />
          <Input name="password" type="password" placeholder="비밀번호" required />
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          Google로 로그인
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 회원가입 페이지 템플릿

```
app/signup/page.tsx
app/signup/SignupForm.tsx
```

### `app/signup/SignupForm.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // TODO: 회원가입 API 호출
    toast.success("회원가입이 완료되었습니다.");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" type="text" placeholder="이름" required />
          <Input name="email" type="email" placeholder="이메일" required />
          <Input name="password" type="password" placeholder="비밀번호" required />
          <Button type="submit" className="w-full">
            회원가입
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## 생성 후 안내

- `middleware.ts`의 `protectedPaths` 배열에서 보호할 경로를 추가/수정하세요.
- Credentials 로그인은 `lib/auth.ts`의 `authorize()` 함수에서 실제 DB 검증 로직을 구현해야 합니다.
