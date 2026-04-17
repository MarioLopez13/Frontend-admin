export const endpoints = {
  auth: {
    // backend real de identity
    login: "/auth/authenticate",

    // estos los dejamos igual por ahora
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
  },
} as const;