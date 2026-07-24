import { env } from "@/app/config/env";
import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { mockLogin } from "@/features/auth/services/auth.mock";
import type {
  AppRole,
  AuthSession,
  AuthUser,
  IdentityLoginResponse,
  LoginRequest,
  LoginResponse,
} from "./auth.types";
import { authStorage } from "./auth.storage";

type JwtPayload = {
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles?: string[];
  };
};

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

function decodeJwtPayload(token: string): JwtPayload {
  try {
    const encodedPayload = token.split(".")[1];

    if (!encodedPayload) {
      throw new Error("JWT sin payload.");
    }

    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0)
    );

    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch {
    throw new Error("No se recibió una sesión válida. Intenta nuevamente.");
  }
}

function resolveRole(payload: JwtPayload): AppRole {
  const roles = (payload.realm_access?.roles ?? []).map((role) =>
    role.toUpperCase()
  );

  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("OPERATOR")) return "operator";
  if (roles.includes("USER")) return "user";

  throw new Error("No tienes autorización para acceder a SmartPayUT.");
}

function buildSession(response: IdentityLoginResponse): AuthSession {
  if (!response.access_token) {
    throw new Error("No se recibió una sesión válida. Intenta nuevamente.");
  }

  const claims = decodeJwtPayload(response.access_token);
  const email =
    claims.email?.trim() || claims.preferred_username?.trim() || "";
  const combinedName = `${claims.given_name?.trim() ?? ""} ${
    claims.family_name?.trim() ?? ""
  }`.trim();
  const fullName = claims.name?.trim() || combinedName || email;
  const id = response.userId || claims.sub;

  if (!id || !email || !fullName) {
    throw new Error("No se recibió una sesión válida. Intenta nuevamente.");
  }

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user: {
      id,
      fullName,
      email,
      role: resolveRole(claims),
    },
  };
}

async function realLogin(payload: LoginRequest): Promise<AuthSession> {
  try {
    const response = await apiClient<IdentityLoginResponse>(
      endpoints.auth.login,
      {
        method: "POST",
        body: {
          username: payload.email.trim().toLowerCase(),
          password: payload.password,
        },
      }
    );

    return buildSession(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    throw error;
  }
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const normalizedPayload: LoginRequest = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    };

    const session = env.useMocks
      ? await mockLogin(normalizedPayload)
      : await realLogin(normalizedPayload);

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

    return session.user;
  },
};
