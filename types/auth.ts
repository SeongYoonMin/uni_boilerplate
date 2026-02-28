export interface IServiceResponse {
  id: number;
  name: string;
}

// next-auth 세션 타입 확장 (id, role 필드 추가)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: string;
  }
}

// Auth.js v5: JWT 타입 확장은 @auth/core/jwt 사용
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
