import { create } from "zustand";
import type { AuthUserDTO } from "@interviewiq/shared";

interface AuthState {
  user: AuthUserDTO | null;
  isHydrated: boolean;
  setUser: (user: AuthUserDTO | null) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: () => set({ isHydrated: true }),
}));
