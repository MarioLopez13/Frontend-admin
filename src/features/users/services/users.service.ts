import type {
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserAdminView,
  UserFilters,
} from "../types/user-admin.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "/api";

function mapBackendUser(u: any): UserAdminView {
  return {
    id: String(u.id ?? ""),
    fullName:
      [u.name, u.lastName].filter(Boolean).join(" ") ||
      u.fullName ||
      "Sin nombre",
    email: u.email ?? "sin-correo@test.com",
    role: "user",
    status: (u.status ?? "INACTIVE").toLowerCase() as
      | "active"
      | "inactive",
    createdAt:
      u.createdAt ?? new Date().toISOString(),
    updatedAt:
      u.updatedAt ?? new Date().toISOString(),
  };
}

function getTokenOrThrow() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "No hay token, inicia sesión nuevamente."
    );
  }

  return token;
}

function buildHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Client-Token":
      "pQfoROQs2QG0WuXwLvuCHocprzq87w774sF5XtVhuMU",
  };
}

export const usersService = {
  async getUsers(
    filters: UserFilters
  ): Promise<UserAdminView[]> {
    const token = getTokenOrThrow();

    const res = await fetch(
      `${API_BASE_URL}/users/search`,
      {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify({
          filter: [],
          query: filters.search?.trim() ?? "",
          page: 0,
          pageSize: 20,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Error al obtener usuarios del backend."
      );
    }

    const data = await res.json();

    const backendUsers =
      data.items ??
      data.data?.items ??
      data.data?.content ??
      data.content ??
      data.data ??
      [];

    const mappedUsers = Array.isArray(backendUsers)
      ? backendUsers.map(mapBackendUser)
      : [];

    if (filters.status === "active") {
      return mappedUsers.filter(
        (user) => user.status === "active"
      );
    }

    if (filters.status === "inactive") {
      return mappedUsers.filter(
        (user) => user.status === "inactive"
      );
    }

    return mappedUsers;
  },

  async getUserById(
    id: string
  ): Promise<UserAdminView | null> {
    const token = getTokenOrThrow();

    const res = await fetch(
      `${API_BASE_URL}/users/${id}`,
      {
        method: "GET",
        headers: buildHeaders(token),
      }
    );

    if (!res.ok) {
      throw new Error(
        "No se pudo cargar el usuario."
      );
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

    const res = await fetch(
      `${API_BASE_URL}/users/${id}`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
        body: JSON.stringify({
          name: payload.fullName,
          email: payload.email,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "No se pudo actualizar el usuario."
      );
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
  ): Promise<void> {
    const token = getTokenOrThrow();

    const res = await fetch(
      `${API_BASE_URL}/users/${id}`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
        body: JSON.stringify({
          status: payload.status.toUpperCase(),
        }),
      }
    );

    if (!res.ok) {
      let backendMessage =
        "No se pudo actualizar el estado del usuario.";

      try {
        const data = await res.json();

        backendMessage =
          data.message ??
          data.error ??
          backendMessage;
      } catch {
        // La respuesta no contiene JSON.
      }

      throw new Error(backendMessage);
    }

    /*
     * El endpoint PATCH devuelve una confirmación,
     * pero no necesariamente devuelve el usuario
     * completo actualizado. Por eso no se transforma
     * su respuesta con mapBackendUser.
     */
  },
};