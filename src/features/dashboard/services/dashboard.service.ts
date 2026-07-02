import { apiClient } from "@/core/api/apiClient";

export type DashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
};

type BackendUser = {
  id?: string;
  email?: string;
  userName?: string;
  name?: string;
  lastName?: string;
  status?: string;
  userType?: string;
};

type BackendPaginatedResponse = {
  data?: BackendUser[];
  totalElements?: number;
  totalElementsPage?: number;
  page?: number;
  size?: number;
};

function normalizeStatus(status?: string): "active" | "inactive" {
  const value = status?.trim().toLowerCase() ?? "";

  if (value === "inactive" || value === "inactivo" || value === "disabled") {
    return "inactive";
  }

  if (value === "active" || value === "activo" || value === "enabled") {
    return "active";
  }

  return "inactive";
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient<BackendPaginatedResponse>("/users/search", {
      method: "POST",
      body: {
        filter: [],
        query: "",
        page: 0,
        pageSize: 200,
      },
    });

    const users = Array.isArray(response.data) ? response.data : [];

    const activeUsers = users.filter(
      (user) => normalizeStatus(user.status) === "active"
    ).length;

    const inactiveUsers = users.filter(
      (user) => normalizeStatus(user.status) === "inactive"
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
    };
  },
};