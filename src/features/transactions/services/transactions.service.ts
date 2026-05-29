import type {
  TransactionFilters,
  TransactionSummary,
  TransactionView,
} from "../types/transaction.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";

type BackendTransaction = {
  id?: string;
  transactionId?: string;
  method?: string;
  status?: string;
  processedAt?: string;
  userId?: string;
  busCode?: string;
  routeName?: string;
  amount?: number;
  previousBalance?: number;
  updatedBalance?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function mapBackendTransaction(t: BackendTransaction): TransactionView {
  const id = String(t.id ?? t.transactionId ?? "");
  const method = (t.method ?? "QR").toUpperCase() as "QR" | "NFC";

  return {
    id,
    reference: id,
    userName: String(t.userId ?? "Usuario demo"),
    userEmail: `${String(t.userId ?? "demo-user")}@smartpayut.local`,
    method,
    status: t.status === "Completado" ? "APPROVED" : "PENDING",
    amount: Number(t.amount ?? 0),
    busCode: String(t.busCode ?? "BUS-DEMO"),
    busLabel: String(t.busCode ?? "BUS-DEMO"),
    routeName: String(t.routeName ?? "Ruta demo"),
    createdAt: String(t.processedAt ?? new Date().toISOString()),
    updatedAt: String(t.processedAt ?? new Date().toISOString()),
    description: `Pago realizado mediante ${method}`,
    technicalMessage: undefined,
  };
}

function matchesDateRange(transaction: TransactionView, filters: TransactionFilters) {
  const transactionDate = transaction.createdAt.slice(0, 10);

  if (filters.dateFrom && transactionDate < filters.dateFrom) {
    return false;
  }

  if (filters.dateTo && transactionDate > filters.dateTo) {
    return false;
  }

  return true;
}

function matchesSearch(transaction: TransactionView, search: string) {
  const query = normalize(search);

  if (!query) {
    return true;
  }

  const searchable = [
    transaction.reference,
    transaction.userName,
    transaction.userEmail,
    transaction.busCode,
    transaction.busLabel,
    transaction.routeName,
    transaction.method,
    transaction.status,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

async function fetchTransactions(): Promise<TransactionView[]> {
  const token =
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_URL}/mobile-payments`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Client-Token": "pQfoROQs2QG0WuXwLvuCHocprzq87w774sF5XtVhuMU",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener transacciones del backend.");
  }

  const data = await res.json();
  const items = data.items ?? data.data ?? data.content ?? [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) =>
    mapBackendTransaction(item as BackendTransaction)
  );
}

export const transactionsService = {
  async getTransactions(filters: TransactionFilters): Promise<TransactionView[]> {
    const transactions = await fetchTransactions();

    return transactions
      .filter((transaction) => {
        const statusMatch =
          filters.status === "all" || transaction.status === filters.status;
        const methodMatch =
          filters.method === "all" || transaction.method === filters.method;

        return (
          statusMatch &&
          methodMatch &&
          matchesSearch(transaction, filters.search) &&
          matchesDateRange(transaction, filters)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  async getSummary(): Promise<TransactionSummary> {
    const transactions = await fetchTransactions();

    const approved = transactions.filter(
      (transaction) => transaction.status === "APPROVED"
    );
    const pending = transactions.filter(
      (transaction) => transaction.status === "PENDING"
    );
    const failed = transactions.filter(
      (transaction) => transaction.status === "FAILED"
    );
    const cancelled = transactions.filter(
      (transaction) => transaction.status === "CANCELLED"
    );

    return {
      total: transactions.length,
      approved: approved.length,
      pending: pending.length,
      failed: failed.length,
      cancelled: cancelled.length,
      approvedAmount: approved.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      ),
    };
  },
};