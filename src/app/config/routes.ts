export const routes = {
  login: "/login",
  unauthorized: "/unauthorized",
  dashboard: "/",
  users: "/users",
  userDetail: (id: string) => `/users/${id}`,
  userEdit: (id: string) => `/users/${id}/edit`,
  payments: "/payments",
  transactions: "/transactions",
  qr: "/qr",
} as const;