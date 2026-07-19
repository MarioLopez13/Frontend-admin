import { apiClient } from "@/core/api/apiClient";
import { transactionsService } from "@/features/transactions/services/transactions.service";

export type DashboardOperationByMethod = {
  method: "QR" | "NFC";
  operations: number;
};

export type DashboardWeeklyOperation = {
  day: string;
  operations: number;
};

export type DashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTransactions: number;
  approvedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  approvedAmount: number;
  operationsByMethod: DashboardOperationByMethod[];
  weeklyOperations: DashboardWeeklyOperation[];
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

  if (
    value === "inactive" ||
    value === "inactivo" ||
    value === "disabled"
  ) {
    return "inactive";
  }

  if (
    value === "active" ||
    value === "activo" ||
    value === "enabled"
  ) {
    return "active";
  }

  return "inactive";
}

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function createWeeklyOperations(
  transactions: Awaited<ReturnType<typeof transactionsService.getTransactions>>
): DashboardWeeklyOperation[] {
  const today = new Date();
  const result: DashboardWeeklyOperation[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - daysAgo);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const operations = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);

      return transactionDate >= date && transactionDate < nextDate;
    }).length;

    result.push({
      day: dayNames[date.getDay()],
      operations,
    });
  }

  return result;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const [usersResponse, transactions, transactionSummary] =
      await Promise.all([
        apiClient<BackendPaginatedResponse>("/users/search", {
          method: "POST",
          body: {
            filter: [],
            query: "",
            page: 0,
            pageSize: 200,
          },
        }),

        transactionsService.getTransactions({
          search: "",
          status: "all",
          method: "all",
          dateFrom: "",
          dateTo: "",
        }),

        transactionsService.getSummary(),
      ]);

    const users = Array.isArray(usersResponse.data)
      ? usersResponse.data
      : [];

    const activeUsers = users.filter(
      (user) => normalizeStatus(user.status) === "active"
    ).length;

    const inactiveUsers = users.filter(
      (user) => normalizeStatus(user.status) === "inactive"
    ).length;

    const qrOperations = transactions.filter(
      (transaction) => transaction.method === "QR"
    ).length;

    const nfcOperations = transactions.filter(
      (transaction) => transaction.method === "NFC"
    ).length;

    return {
      totalUsers: usersResponse.totalElements ?? users.length,
      activeUsers,
      inactiveUsers,

      totalTransactions: transactionSummary.total,
      approvedTransactions: transactionSummary.approved,
      pendingTransactions: transactionSummary.pending,
      failedTransactions:
        transactionSummary.failed + transactionSummary.cancelled,
      approvedAmount: transactionSummary.approvedAmount,

      operationsByMethod: [
        {
          method: "QR",
          operations: qrOperations,
        },
        {
          method: "NFC",
          operations: nfcOperations,
        },
      ],

      weeklyOperations: createWeeklyOperations(transactions),
    };
  },
};