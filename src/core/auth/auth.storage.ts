import type { AuthSession } from "./auth.types";

const AUTH_STORAGE_KEY = "smartpayout-admin-auth";

export const authStorage = {
  getSession(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  setSession(session: AuthSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};