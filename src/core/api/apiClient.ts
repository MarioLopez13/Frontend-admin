import { env } from "@/app/config/env";
import { authStorage } from "@/core/auth/auth.storage";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  token?: string;
};

type ApiErrorOptions = {
  status?: number;
  title?: string;
  detail?: string;
};

export class ApiError extends Error {
  status?: number;
  title: string;
  detail?: string;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.title = options.title ?? "Error";
    this.detail = options.detail;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stripTechnicalNoise(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/["{}[\]]/g, "")
    .trim();
}

function limitMessage(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function extractMessageFromPayload(payload: unknown): string {
  if (!payload) return "";

  if (typeof payload === "string") {
    return stripTechnicalNoise(payload);
  }

  if (isRecord(payload)) {
    const candidates = [
      payload.message,
      payload.errorMessage,
      payload.error_description,
      payload.errorDescription,
      payload.detail,
      payload.error,
      payload.title,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return stripTechnicalNoise(candidate);
      }
    }

    const errors = payload.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];

      if (typeof firstError === "string") {
        return stripTechnicalNoise(firstError);
      }

      if (isRecord(firstError)) {
        const nestedMessage =
          firstError.message ?? firstError.defaultMessage ?? firstError.detail;

        if (typeof nestedMessage === "string" && nestedMessage.trim()) {
          return stripTechnicalNoise(nestedMessage);
        }
      }
    }
  }

  return "";
}

function getFriendlyAuthMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  const isBadCredentials =
    lowerMessage.includes("invalid_grant") ||
    lowerMessage.includes("invalid user credentials") ||
    lowerMessage.includes("bad credentials") ||
    lowerMessage.includes("contraseña incorrecta") ||
    lowerMessage.includes("password incorrect") ||
    lowerMessage.includes("credenciales") ||
    lowerMessage.includes("unauthorized");

  if (isBadCredentials) {
    return "Correo o contraseña incorrectos.";
  }

  return "";
}

function getFriendlyErrorMessage(payload: unknown, status: number): string {
  const rawMessage = extractMessageFromPayload(payload);
  const authMessage = getFriendlyAuthMessage(rawMessage);

  if (authMessage) return authMessage;

  switch (status) {
    case 400:
      return rawMessage
        ? limitMessage(rawMessage)
        : "La solicitud enviada no es válida.";
    case 401:
      return "Tu sesión no es válida o ha expirado. Vuelve a iniciar sesión.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "No se encontró la información solicitada.";
    case 409:
      return rawMessage
        ? limitMessage(rawMessage)
        : "La operación no se pudo completar por un conflicto de datos.";
    case 422:
      return rawMessage
        ? limitMessage(rawMessage)
        : "Hay datos inválidos. Revisa la información ingresada.";
    case 500:
      return "Ocurrió un problema en el servidor. Intenta nuevamente o reporta el caso.";
    case 502:
    case 503:
    case 504:
      return "El servicio no está disponible en este momento. Intenta nuevamente.";
    default:
      return rawMessage
        ? limitMessage(rawMessage)
        : `No se pudo completar la operación. Código ${status}.`;
  }
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiClient<T>(
  path: string,
  { method = "GET", headers, body, token }: RequestOptions = {}
): Promise<T> {
  const session = authStorage.getSession();
  const accessToken = token ?? session?.accessToken;

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      const message = getFriendlyErrorMessage(payload, response.status);

      throw new ApiError(message, {
        status: response.status,
        title: "No se pudo completar la operación",
        detail: extractMessageFromPayload(payload),
      });
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "No se pudo conectar con el backend. Verifica que el servicio esté encendido.",
      {
        title: "Backend no disponible",
      }
    );
  }
}