export const endpoints = {
  auth: {
    // backend real de identity
    login: "/auth/authenticate",

    // estos los dejamos igual por ahora
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh-token",
  },
  users: {
    search: "/users/search",
    summary: "/users/summary",
    create: "/users",
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  transactions: {
    admin: "/admin/transactions",
    dashboard: "/admin/transactions/dashboard",
  },
  payments: {
    admin: "/payments",
  },
} as const;
