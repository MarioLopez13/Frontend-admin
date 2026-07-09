import { env } from "@/app/config/env";
import { authStorage } from "@/core/auth/auth.storage";
import type {
  TransactionFilters,
  TransactionSummary,
  TransactionView,
} from "../types/transaction.types";

const API_BASE_URL = env.apiBaseUrl.replace(/\/$/, "");

type TransactionStatusView = "APPROVED" | "PENDING" | "FAILED" | "CANCELLED";

type BackendTransaction = {
  id?: string;
  transactionId?: string;
  method?: string;
  status?: string;
  processedAt?: string;
  userId?: string;
  userName?: string;
  fullName?: string;
  userFullName?: string;
  email?: string;
  userEmail?: string;
  busCode?: string;
  routeName?: string;
  amount?: number;
  previousBalance?: number;
  updatedBalance?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeStatus(status?: string): TransactionStatusView {
  const value = normalize(status ?? "");

  if (
    value === "completado" ||
    value === "completed" ||
    value === "approved" ||
    value === "aprobado" ||
    value === "aprobada"
  ) {
    return "APPROVED";
  }

  if (
    value === "fallido" ||
    value === "fallida" ||
    value === "failed" ||
    value === "error"
  ) {
    return "FAILED";
  }

  if (
    value === "cancelado" ||
    value === "cancelada" ||
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "CANCELLED";
  }

  return "PENDING";
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function resolveUserName(transaction: BackendTransaction) {
  const userId = String(transaction.userId ?? "").trim();
  const sessionUser = authStorage.getSession()?.user;

  const candidates = [
    transaction.userName,
    transaction.userFullName,
    transaction.fullName,
  ];

  for (const candidate of candidates) {
    if (candidate?.trim() && !looksLikeUuid(candidate.trim())) {
      return candidate.trim();
    }
  }

  if (sessionUser?.id && userId && sessionUser.id === userId) {
    return sessionUser.fullName || "Admin SmartPayUT";
  }

  return "Usuario SmartPayUT";
}

function resolveUserEmail(transaction: BackendTransaction) {
  const userId = String(transaction.userId ?? "").trim();
  const sessionUser = authStorage.getSession()?.user;

  const candidates = [transaction.userEmail, transaction.email];

  for (const candidate of candidates) {
    if (candidate?.trim() && candidate.includes("@")) {
      return candidate.trim();
    }
  }

  if (sessionUser?.id && userId && sessionUser.id === userId) {
    return sessionUser.email || "admin@smartpayut.com";
  }

  return "Cuenta registrada";
}

function mapBackendTransaction(t: BackendTransaction): TransactionView {
  const id = String(t.id ?? t.transactionId ?? "");
  const method = (t.method ?? "QR").toUpperCase() as "QR" | "NFC";

  return {
    id,
    reference: id,
    userName: resolveUserName(t),
    userEmail: resolveUserEmail(t),
    method,
    status: normalizeStatus(t.status),
    amount: Number(t.amount ?? 0),
    busCode: String(t.busCode ?? "Sin unidad"),
    busLabel: String(t.busCode ?? "Sin unidad"),
    routeName: String(t.routeName ?? "Sin ruta"),
    createdAt: String(t.processedAt ?? new Date().toISOString()),
    updatedAt: String(t.processedAt ?? new Date().toISOString()),
    description: `Pago registrado mediante ${method}`,
    technicalMessage: undefined,
  };
}

function matchesDateRange(
  transaction: TransactionView,
  filters: TransactionFilters
) {
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
    throw new Error("No se pudieron obtener las transacciones del servicio.");
  }

  const data = await res.json();
  const items = data.items ?? data.data ?? data.content ?? [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => mapBackendTransaction(item as BackendTransaction));
}

export const transactionsService = {
  async getTransactions(
    filters: TransactionFilters
  ): Promise<TransactionView[]> {
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