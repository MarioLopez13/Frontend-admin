import { env } from "@/app/config/env";
import { authStorage } from "@/core/auth/auth.storage";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  token?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const error = payload.error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  switch (status) {
    case 400:
      return "Solicitud inválida.";
    case 401:
      return "Sesión inválida o expirada.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "Recurso no encontrado.";
    case 500:
      return "Error interno del servidor.";
    default:
      return `Error HTTP ${status}`;
  }
}

export async function apiClient<T>(
  path: string,
  { method = "GET", headers, body, token }: RequestOptions = {}
): Promise<T> {
  const session = authStorage.getSession();
  const accessToken = token ?? session?.accessToken;

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasJsonBody = contentType.includes("application/json");

  const payload = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload as T;
}