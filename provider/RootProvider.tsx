"use client";

import AuthProvider from "./AuthProvider";
import QueryProvider from "./QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
        <Toaster richColors closeButton />
      </QueryProvider>
    </AuthProvider>
  );
}
