"use client";

import { useSession as useNextAuthSession, signIn, signOut } from "next-auth/react";

export function useSession() {
  const session = useNextAuthSession();

  const login = (provider?: string, options?: { callbackUrl?: string }) => {
    return signIn(provider, options);
  };

  const logout = (options?: { callbackUrl?: string }) => {
    return signOut(options);
  };

  return {
    ...session,
    user: session.data?.user ?? null,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
    login,
    logout,
  };
}
