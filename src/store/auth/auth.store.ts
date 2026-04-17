import { create } from "zustand";
import { authService } from "@/core/auth/auth.service";
import type { AuthSession, LoginRequest } from "@/core/auth/auth.types";

type AuthStore = {
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrateSession: () => Promise<void>;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrateSession: async () => {
    const session = authService.getCurrentSession();

    if (!session) {
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
      return;
    }

    const user = await authService.getCurrentUser();

    if (!user) {
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
      return;
    }

    const hydratedSession: AuthSession = {
      ...session,
      user,
    };

    set({
      session: hydratedSession,
      user,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  login: async (payload) => {
    const session = await authService.login(payload);

    set({
      session,
      user: session.user,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  logout: () => {
    authService.logout();

    set({
      session: null,
      user: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },
}));