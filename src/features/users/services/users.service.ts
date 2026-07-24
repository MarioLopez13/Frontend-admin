import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { authStorage } from "@/core/auth/auth.storage";
import {
  mapBackendUserToAdminView,
  type BackendUser,
  type UsersSearchResponse,
} from "./users.adapter";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserAdminView,
  UserFilters,
  UsersPageResult,
} from "../types/user-admin.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function handleUsersError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");
      throw new Error("La sesión expiró. Inicie sesión nuevamente.");
    }

    if (error.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción.");
    }

    if (error.status === 404) {
      throw new Error("No se encontró el usuario solicitado.");
    }

    if (error.status === 409) {
      throw new Error("Ya existe un usuario con el correo o username ingresado.");
    }

    if (error.status === 400 || error.status === 422) {
      throw new Error("Revise los datos ingresados e intente nuevamente.");
    }

    if (error.status && error.status >= 500) {
      throw new Error("Ocurrió un problema al procesar la solicitud.");
    }
  }

  throw new Error("No se pudo completar la operación de usuarios.");
}

async function usersRequest<T>(
  path: string,
  options?: Parameters<typeof apiClient<T>>[1]
): Promise<T> {
  try {
    return await apiClient<T>(path, options);
  } catch (error) {
    return handleUsersError(error);
  }
}

export const usersService = {
  async getUsers(
    filters: UserFilters,
    page = 0,
    pageSize = 20
  ): Promise<UsersPageResult> {
    const response = await usersRequest<UsersSearchResponse>(
      endpoints.users.search,
      {
        method: "POST",
        body: {
          filter: [],
          query: filters.search.trim(),
          page,
          pageSize,
        },
      }
    );

    const mappedUsers = response.items
      .filter((user) => user.status !== "DELETED")
      .map(mapBackendUserToAdminView);
    const items =
      filters.status === "all"
        ? mappedUsers
        : mappedUsers.filter((user) => user.status === filters.status);

    return {
      items,
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  },

  async getUserById(id: string): Promise<UserAdminView> {
    const response = await usersRequest<ApiResponse<BackendUser>>(
      endpoints.users.detail(id)
    );

    return mapBackendUserToAdminView(response.data);
  },

  async createUser(payload: CreateUserRequest): Promise<UserAdminView> {
    const response = await usersRequest<ApiResponse<BackendUser>>(
      endpoints.users.create,
      {
        method: "POST",
        body: {
          userName: payload.userName.trim().toLowerCase(),
          email: payload.email.trim().toLowerCase(),
          name: payload.name.trim(),
          lastName: payload.lastName.trim(),
          password: payload.password,
        },
      }
    );

    return mapBackendUserToAdminView(response.data);
  },

  async updateUser(
    id: string,
    payload: UpdateUserRequest
  ): Promise<UserAdminView> {
    const response = await usersRequest<ApiResponse<BackendUser>>(
      endpoints.users.update(id),
      {
        method: "PATCH",
        body: {
          name: payload.name.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim().toLowerCase(),
        },
      }
    );

    return mapBackendUserToAdminView(response.data);
  },

  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusRequest
  ): Promise<UserAdminView> {
    const response = await usersRequest<ApiResponse<BackendUser>>(
      endpoints.users.update(id),
      {
        method: "PATCH",
        body: {
          status: payload.status.toUpperCase(),
        },
      }
    );

    return mapBackendUserToAdminView(response.data);
  },

  async deleteUser(id: string): Promise<void> {
    await usersRequest<ApiResponse<null>>(endpoints.users.delete(id), {
      method: "DELETE",
    });
  },
};
