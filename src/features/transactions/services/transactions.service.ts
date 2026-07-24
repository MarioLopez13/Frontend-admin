import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { authStorage } from "@/core/auth/auth.storage";
import { mapAdminTransaction } from "./transactions.adapter";
import type {
  AdminTransactionPage,
  ApiResponse,
  GetAdminTransactionsParams,
  TransactionPageData,
} from "../types/transaction.types";

function transactionError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");

      throw new Error(
        "Tu sesión expiró. Vuelve a iniciar sesión para consultar las transacciones."
      );
    }

    if (error.status === 403) {
      throw new Error("No tienes permisos para consultar las transacciones.");
    }

    if (error.status && error.status >= 500) {
      throw new Error(
        "Transaction Service no está disponible. Intenta nuevamente."
      );
    }
  }

  throw new Error("No se pudieron cargar las transacciones.");
}

export async function getAdminTransactions({
  page,
  pageSize,
  search = "",
  type = "all",
  method = "all",
  status = "all",
  from = "",
  to = "",
}: GetAdminTransactionsParams): Promise<AdminTransactionPage> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }
  if (type !== "all") {
    query.set("type", type);
  }
  if (method !== "all") {
    query.set("method", method);
  }
  if (status !== "all") {
    query.set("status", status);
  }
  if (from) {
    query.set("from", from);
  }
  if (to) {
    query.set("to", to);
  }

  try {
    const response = await apiClient<ApiResponse<TransactionPageData>>(
      `${endpoints.transactions.admin}?${query.toString()}`
    );

    return {
      ...response.data,
      items: response.data.items.map(mapAdminTransaction),
    };
  } catch (error) {
    return transactionError(error);
  }
}

export const transactionsService = {
  getAdminTransactions,
};
