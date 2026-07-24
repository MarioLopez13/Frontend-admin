import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { authStorage } from "@/core/auth/auth.storage";
import type {
  ApiResponse,
  DashboardOperationByMethod,
  DashboardSummaryViewModel,
  TransactionDashboardData,
  UserSummaryData,
} from "../types/dashboard.types";

export const DEFAULT_DASHBOARD_DAYS = 7;

const METHOD_PRIORITY = ["QR", "NFC", "PLACETOPAY"] as const;

function methodOrder(method: string): number {
  const index = METHOD_PRIORITY.indexOf(
    method as (typeof METHOD_PRIORITY)[number]
  );
  return index === -1 ? METHOD_PRIORITY.length : index;
}

function mapOperationsByMethod(
  operations: Record<string, number>
): DashboardOperationByMethod[] {
  return Object.entries(operations)
    .map(([method, count]) => ({
      method,
      operations: count,
    }))
    .sort((first, second) => {
      const priorityDifference =
        methodOrder(first.method) - methodOrder(second.method);

      return priorityDifference !== 0
        ? priorityDifference
        : first.method.localeCompare(second.method);
    });
}

function handleDashboardError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");
      throw new Error("La sesión expiró. Inicie sesión nuevamente.");
    }

    if (error.status === 403) {
      throw new Error("No tiene autorización para consultar el Dashboard.");
    }

    if (error.status && error.status >= 500) {
      throw new Error(
        "No fue posible cargar el Dashboard. Intente nuevamente."
      );
    }
  }

  throw new Error(
    "No fue posible cargar el Dashboard. Verifique su conexión e intente nuevamente."
  );
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryViewModel> {
    try {
      const [usersResponse, transactionsResponse] = await Promise.all([
        apiClient<ApiResponse<UserSummaryData>>(endpoints.users.summary),
        apiClient<ApiResponse<TransactionDashboardData>>(
          `${endpoints.transactions.dashboard}?days=${DEFAULT_DASHBOARD_DAYS}`
        ),
      ]);

      return {
        userSummary: usersResponse.data,
        transactionSummary: transactionsResponse.data,
        operationsByMethod: mapOperationsByMethod(
          transactionsResponse.data.operationsByMethod
        ),
        dailyOperations: transactionsResponse.data.dailyOperations.map(
          (operation) => ({
            date: operation.date,
            operations: operation.count,
          })
        ),
      };
    } catch (error) {
      return handleDashboardError(error);
    }
  },
};
