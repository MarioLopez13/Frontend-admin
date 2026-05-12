import type {
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserAdminView,
  UserFilters,
} from "../types/user-admin.types";

function mapBackendUser(u: any): UserAdminView {
  return {
    id: String(u.id ?? ""),
    fullName:
      [u.name, u.lastName].filter(Boolean).join(" ") ||
      u.fullName ||
      "Sin nombre",
    email: u.email ?? "sin-correo@test.com",
    role: "user",
    status: (u.status ?? "INACTIVE").toLowerCase() as "active" | "inactive",
    createdAt: u.createdAt ?? new Date().toISOString(),
    updatedAt: u.updatedAt ?? new Date().toISOString(),
  };
}

function getTokenOrThrow() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token, inicia sesión nuevamente.");
  }

  return token;
}

function buildHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
    "X-Client-Token": "pQfoROQs2QG0WuXwLvuCHocprzq87w774sF5XtVhuMU",
  };
}

export const usersService = {
  async getUsers(filters: UserFilters): Promise<UserAdminView[]> {
    const token = getTokenOrThrow();

    const res = await fetch("/identity/api/users/search", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({
    filter: [],
    query: filters.search?.trim() ?? "",
    page: 0,
    pageSize: 20,
      }),
    });

    if (!res.ok) {
      throw new Error("Error al obtener usuarios del backend.");
    }

    const data = await res.json();
    const users = data.items ?? data.data ?? data.content ?? [];

    return Array.isArray(users) ? users.map(mapBackendUser) : [];
  },

  async getUserById(id: string): Promise<UserAdminView | null> {
    const token = getTokenOrThrow();

    const res = await fetch(`/identity/api/users/${id}`, {
      method: "GET",
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      throw new Error("No se pudo cargar el usuario.");
    }

    const data = await res.json();

    if (data.error) {
      return null;
    }

    return mapBackendUser(data.data ?? data);
  },

  async updateUser(
    id: string,
    payload: UpdateUserRequest
  ): Promise<UserAdminView> {
    const token = getTokenOrThrow();

    const res = await fetch(`/identity/api/users/${id}`, {
      method: "PATCH",
      headers: buildHeaders(token),
      body: JSON.stringify({
        name: payload.fullName,
        email: payload.email,
      }),
    });

    if (!res.ok) {
      throw new Error("No se pudo actualizar el usuario.");
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return mapBackendUser(data.data ?? data);
  },

  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusRequest
  ): Promise<UserAdminView> {
    const token = getTokenOrThrow();

    const res = await fetch(`/identity/api/users/${id}`, {
      method: "PATCH",
      headers: buildHeaders(token),
      body: JSON.stringify({
        status: payload.status.toUpperCase(),
      }),
    });

    if (!res.ok) {
      throw new Error("No se pudo actualizar el estado del usuario.");
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return mapBackendUser(data.data ?? data);
  },
};