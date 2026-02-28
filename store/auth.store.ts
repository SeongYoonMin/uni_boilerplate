/**
 * Auth Store Zustand
 */
import { create } from "zustand";

interface AuthState {
  userId: string | null;
  userName: string | null;
  setUser: (userId: string, userName: string) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  userName: null,
  setUser: (userId: string, userName: string) => set({ userId, userName }),
  clearUser: () => set({ userId: null, userName: null }),
}));
