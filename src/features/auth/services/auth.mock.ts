import { env } from "@/app/config/env";
import { endpoints } from "@/core/api/endpoints";
import type {
  AppRole,
  LoginRequest,
  LoginResponse,
} from "@/core/auth/auth.types";

type BackendAuthResponse = {
  access_token: string;
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
  return jwt?.sub ?? "temp-user";
}

export async function mockLogin({
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

  const data: BackendAuthResponse | { message?: string; error?: string } =
    await res.json();

  if (!res.ok || !("access_token" in data) || !data.access_token) {
    throw new Error(
      ("message" in data && data.message) ||
        ("error" in data && data.error) ||
        "Credenciales inválidas"
    );
  }

  localStorage.setItem("token", data.access_token);

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
}