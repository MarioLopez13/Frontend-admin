import { mockLogin } from "@/features/auth/services/auth.mock";
import type {
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "./auth.types";
import { authStorage } from "./auth.storage";

function isValidSession(session: AuthSession | null): session is AuthSession {
  return !!(
    session &&
    session.accessToken &&
    session.user &&
    session.user.id &&
    session.user.email &&
    session.user.role
  );
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const normalizedPayload: LoginRequest = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    };

    // Aunque el archivo se llame mockLogin, ya lo adaptamos para usar el backend real
    const session = await mockLogin(normalizedPayload);

    authStorage.setSession(session);
    return session;
  },

  logout() {
    authStorage.clearSession();
  },

  getCurrentSession(): AuthSession | null {
    const session = authStorage.getSession();

    if (!isValidSession(session)) {
      authStorage.clearSession();
      return null;
    }

    return session;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = this.getCurrentSession();
    if (!session) return null;

    // Por ahora usamos el usuario guardado en sesión
    // y no llamamos /auth/me porque ese flujo aún no está adaptado
    return session.user;
  },
};