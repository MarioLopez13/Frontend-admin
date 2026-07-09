function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/api";
  }

  return trimmed.replace(/\/$/, "");
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const rawUseMocks = import.meta.env.VITE_USE_MOCKS?.trim().toLowerCase();

export const env = {
  appName: "SmartPayUT Admin",
  appEnv: import.meta.env.MODE ?? "development",
  apiBaseUrl: normalizeBaseUrl(rawApiBaseUrl || "/api"),
  useMocks: rawUseMocks === "true",
} as const;