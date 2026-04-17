import { usersService } from "@/features/users/services/users.service";

export type DashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
};

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const users = await usersService.getUsers({
      search: "",
      status: "all",
    });

    const activeUsers = users.filter((user) => user.status === "active").length;
    const inactiveUsers = users.filter((user) => user.status === "inactive").length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
    };
  },
};