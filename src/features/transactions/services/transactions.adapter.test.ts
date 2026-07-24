import { describe, expect, it } from "vitest";
import {
  formatTransactionDate,
  mapAdminTransaction,
} from "./transactions.adapter";
import type { AdminTransaction } from "../types/transaction.types";

function transaction(
  overrides: Partial<AdminTransaction> = {}
): AdminTransaction {
  return {
    id: "transaction-1",
    correlationId: "correlation-1",
    type: "PAYMENT",
    method: "QR",
    status: "COMPLETED",
    amount: 0.35,
    occurredAt: "2026-07-24T04:34:00Z",
    userId: "user-1",
    walletId: "wallet-1",
    busCode: "BUS-01",
    routeName: "Ruta Centro",
    balanceBefore: 5,
    balanceAfter: 4.65,
    currency: "USD",
    failureReason: null,
    ...overrides,
  };
}

describe("transactions adapter", () => {
  it.each([
    ["PAYMENT", "Pago"],
    ["TOP_UP", "Recarga"],
    ["CREDIT", "Crédito"],
    ["DEBIT", "Débito"],
    ["REFUND", "Reembolso"],
    ["WALLET_CREATED", "Creación de billetera"],
  ])("maps transaction type %s", (type, expected) => {
    expect(mapAdminTransaction(transaction({ type })).typeLabel).toBe(expected);
  });

  it.each([
    ["QR", "QR"],
    ["NFC", "NFC"],
    ["PLACETOPAY", "PlaceToPay"],
  ])("maps method %s", (method, expected) => {
    expect(mapAdminTransaction(transaction({ method })).methodLabel).toBe(
      expected
    );
  });

  it.each([
    ["COMPLETED", "Completada"],
    ["PENDING", "Pendiente"],
    ["FAILED", "Fallida"],
    ["REFUNDED", "Reembolsada"],
  ])("maps status %s", (status, expected) => {
    expect(mapAdminTransaction(transaction({ status })).statusLabel).toBe(
      expected
    );
  });

  it("preserves future values and handles nullable fields", () => {
    const result = mapAdminTransaction(
      transaction({
        type: "FUTURE_TYPE",
        method: null,
        status: "FUTURE_STATUS",
        userId: null,
        busCode: null,
        routeName: null,
      })
    );

    expect(result.typeLabel).toBe("FUTURE_TYPE");
    expect(result.methodLabel).toBe("Sin método");
    expect(result.statusLabel).toBe("FUTURE_STATUS");
    expect(result.userLabel).toBe("—");
    expect(result.busLabel).toBe("—");
    expect(result.routeLabel).toBe("—");
  });

  it("formats UTC in the America/Guayaquil time zone", () => {
    expect(formatTransactionDate("2026-07-24T04:34:00Z")).toContain(
      "23:34"
    );
    expect(formatTransactionDate("2026-07-24T04:34:00Z")).toContain("23 jul");
  });
});
