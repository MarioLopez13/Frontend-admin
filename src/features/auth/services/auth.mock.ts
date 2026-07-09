import { env } from "@/app/config/env";
import { endpoints } from "@/core/api/endpoints";
import type {
  AppRole,
  LoginRequest,
  LoginResponse,
} from "@/core/auth/auth.types";

type BackendAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

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
  resource_access?: Record<string, { roles?: string[] }>;
};

function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );

    return JSON.parse(normalized) as JwtPayload;
  } catch {
    return null;
  }
}

function inferRole(email: string, token: string): AppRole {
  const jwt = parseJwt(token);

  const realmRoles = jwt?.realm_access?.roles ?? [];
  const resourceRoles = Object.values(jwt?.resource_access ?? {}).flatMap(
    (entry) => entry.roles ?? []
  );

  const allRoles = [...realmRoles, ...resourceRoles].map((role) =>
    role.toLowerCase()
  );

  if (allRoles.includes("admin")) return "admin";
  if (allRoles.includes("operator")) return "operator";
  if (allRoles.includes("user")) return "user";

  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail.includes("admin")) return "admin";
  if (normalizedEmail.includes("operator")) return "operator";

  return "user";
}

function inferFullName(email: string, token: string): string {
  const jwt = parseJwt(token);

  if (jwt?.name?.trim()) return jwt.name.trim();

  const firstName = jwt?.given_name?.trim() ?? "";
  const lastName = jwt?.family_name?.trim() ?? "";
  const combined = `${firstName} ${lastName}`.trim();

  if (combined) return combined;

  return email.split("@")[0];
}

function inferUserId(token: string): string {
  const jwt = parseJwt(token);
  return jwt?.sub ?? "admin-user";
}

function cleanTechnicalText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/["{}[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBackendMessage(payload: unknown) {
  if (!payload) return "";

  if (typeof payload === "string") {
    return cleanTechnicalText(payload);
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;

    const candidates = [
      record.message,
      record.errorMessage,
      record.error_description,
      record.errorDescription,
      record.detail,
      record.error,
      record.title,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return cleanTechnicalText(candidate);
      }
    }
  }

  return "";
}

function getFriendlyLoginMessage(status?: number, payload?: unknown) {
  const rawMessage = extractBackendMessage(payload);
  const message = rawMessage.toLowerCase();

  const isInvalidCredentials =
    status === 401 ||
    message.includes("invalid_grant") ||
    message.includes("invalid user credentials") ||
    message.includes("bad credentials") ||
    message.includes("unauthorized") ||
    message.includes("credenciales") ||
    message.includes("contraseña");

  if (isInvalidCredentials) {
    return "Correo o contraseña incorrectos.";
  }

  if (status === 400) {
    return "La solicitud enviada no es válida. Revisa los datos ingresados.";
  }

  if (status === 403) {
    return "No tienes permisos para acceder al panel administrativo.";
  }

  if (status === 404) {
    return "No se encontró el servicio de autenticación.";
  }

  if (status && status >= 500) {
    return "Ocurrió un problema en el servidor. Intenta nuevamente.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network error")
  ) {
    return "No se pudo conectar con el servicio. Verifica tu conexión e intenta nuevamente.";
  }

  return rawMessage || "No se pudo iniciar sesión. Intenta nuevamente.";
}

async function parseResponseSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function authenticateAdmin({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> {
  if (!email.trim() || !password.trim()) {
    throw new Error("Completa el correo y la contraseña.");
  }

  if (!email.includes("@")) {
    throw new Error("Ingresa un correo válido.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch(`${env.apiBaseUrl}${endpoints.auth.login}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: normalizedEmail,
        password,
      }),
    });

    const payload = await parseResponseSafely(res);

    if (!res.ok) {
      throw new Error(getFriendlyLoginMessage(res.status, payload));
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("access_token" in payload)
    ) {
      throw new Error(
        "No se recibió una sesión válida. Intenta nuevamente."
      );
    }

    const data = payload as BackendAuthResponse;

    if (!data.access_token) {
      throw new Error(
        "No se recibió una sesión válida. Intenta nuevamente."
      );
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("accessToken", data.access_token);

    if (data.refresh_token) {
      localStorage.setItem("refreshToken", data.refresh_token);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? "",
      user: {
        id: inferUserId(data.access_token),
        fullName: inferFullName(normalizedEmail, data.access_token),
        email: normalizedEmail,
        role: inferRole(normalizedEmail, data.access_token),
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(getFriendlyLoginMessage(undefined, error.message));
    }

    throw new Error("No se pudo iniciar sesión. Intenta nuevamente.");
  }
}

export const login = authenticateAdmin;
export const mockLogin = authenticateAdmin;