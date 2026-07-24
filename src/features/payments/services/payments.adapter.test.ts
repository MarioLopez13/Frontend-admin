import { describe, expect, it } from "vitest";
import {
  formatPaymentDate,
  isQrOrNfcPayment,
  mapAdminPayment,
} from "./payments.adapter";
import type { AdminPayment } from "../types/payment.types";

function payment(
  overrides: Partial<AdminPayment> = {}
): AdminPayment {
  return {
    id: "payment-1",
    transactionId: "transaction-1",
    userId: "user-1",
    method: "QR",
    paymentStatus: "COMPLETED",
    status: "Completado",
    amount: 0.35,
    currency: "USD",
    busCode: "BUS-01",
    routeName: "Ruta Centro",
    previousBalance: 5,
    updatedBalance: 4.65,
    processedAt: "2026-07-24T04:34:00Z",
    failureReason: null,
    ...overrides,
  };
}

describe("payments adapter", () => {
  it("includes PAYMENT operations made with QR", () => {
    expect(isQrOrNfcPayment(payment({ method: "QR" }))).toBe(true);
  });

  it("includes PAYMENT operations made with NFC", () => {
    expect(isQrOrNfcPayment(payment({ method: "NFC" }))).toBe(true);
  });

  it("excludes TOP_UP operations represented by PLACETOPAY", () => {
    expect(isQrOrNfcPayment(payment({ method: "PLACETOPAY" }))).toBe(false);
  });

  it("excludes WALLET_CREATED and other non-payment records", () => {
    expect(isQrOrNfcPayment(payment({ method: null }))).toBe(false);
    expect(isQrOrNfcPayment(payment({ method: "WALLET_CREATED" }))).toBe(false);
  });

  it.each([
    ["COMPLETED", "Completado"],
    ["PENDING", "Pendiente"],
    ["PROCESSING", "En proceso"],
    ["FAILED", "Fallido"],
    ["REFUNDED", "Reembolsado"],
  ])("maps status %s to %s", (paymentStatus, expected) => {
    expect(mapAdminPayment(payment({ paymentStatus })).statusLabel).toBe(
      expected
    );
  });

  it("keeps future status values visible", () => {
    expect(
      mapAdminPayment(payment({ paymentStatus: "UNDER_REVIEW" })).statusLabel
    ).toBe("UNDER_REVIEW");
  });

  it("maps nullable presentation values without inventing data", () => {
    const result = mapAdminPayment(
      payment({
        userId: "",
        method: null,
        busCode: null,
        routeName: null,
      })
    );

    expect(result.userLabel).toBe("—");
    expect(result.methodLabel).toBe("Sin método");
    expect(result.busLabel).toBe("Sin unidad");
    expect(result.routeLabel).toBe("Sin ruta");
  });

  it("converts UTC to America/Guayaquil without manual offsets", () => {
    expect(formatPaymentDate("2026-07-24T04:34:00Z")).toBe(
      "23 jul 2026, 23:34"
    );
  });

  it("handles invalid dates", () => {
    expect(formatPaymentDate("invalid-date")).toBe("—");
  });
});
