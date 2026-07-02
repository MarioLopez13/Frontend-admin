const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawUseMocks = import.meta.env.VITE_USE_MOCKS?.trim().toLowerCase();

export const env = {
  appName: "SmartPayUT Admin",
  appEnv: import.meta.env.MODE ?? "development",
  apiBaseUrl: rawApiBaseUrl || "/api",
  useMocks: rawUseMocks === "true",
} as const;
