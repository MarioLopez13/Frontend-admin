import type {
  TransactionFilters,
  TransactionSummary,
  TransactionView,
} from "../types/transaction.types";
import { mockTransactions } from "./transactions.mock";

function normalize(value: string) {
  return value.trim().toLowerCase();
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

export const transactionsService = {
  async getTransactions(filters: TransactionFilters): Promise<TransactionView[]> {
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    return mockTransactions
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
    await new Promise((resolve) => window.setTimeout(resolve, 200));

    const approved = mockTransactions.filter(
      (transaction) => transaction.status === "APPROVED"
    );
    const pending = mockTransactions.filter(
      (transaction) => transaction.status === "PENDING"
    );
    const failed = mockTransactions.filter(
      (transaction) => transaction.status === "FAILED"
    );
    const cancelled = mockTransactions.filter(
      (transaction) => transaction.status === "CANCELLED"
    );

    return {
      total: mockTransactions.length,
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

/*
Contrato esperado para backend Sprint 3:

GET /transactions?search=&status=&method=&dateFrom=&dateTo=
Respuesta sugerida:
{
  "items": [
    {
      "id": "uuid",
      "reference": "SPU-QR-20260517-001",
      "userName": "Juan Pérez",
      "userEmail": "juan.perez@test.com",
      "method": "QR",
      "status": "APPROVED",
      "amount": 0.35,
      "busCode": "BUS-001",
      "busLabel": "Bus 001",
      "routeName": "12 de Octubre",
      "createdAt": "2026-05-17T08:15:00",
      "updatedAt": "2026-05-17T08:15:03",
      "description": "Pago realizado mediante QR",
      "technicalMessage": null
    }
  ]
}

Estados usados por frontend:
APPROVED, PENDING, FAILED, CANCELLED

Métodos usados por frontend:
QR, NFC
*/
