export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "SmartPayout Admin",
  appEnv: import.meta.env.VITE_APP_ENV ?? "development",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "false") === "true",
} as const;