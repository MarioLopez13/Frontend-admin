import { describe, expect, it } from "vitest";
import { groupQrUnits } from "./qr.adapter";
import type { QrPayment } from "../types/qr.types";

function payment(
  overrides: Partial<QrPayment> = {}
): QrPayment {
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

describe("qr adapter", () => {
  it("groups multiple QR payments by busCode", () => {
    const result = groupQrUnits([
      payment({ id: "first" }),
      payment({ id: "second" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("BUS-01");
  });

  it("uses the most recent QR payment for route and fare", () => {
    const result = groupQrUnits([
      payment({
        amount: 0.35,
        routeName: "Ruta anterior",
        processedAt: "2026-07-23T04:34:00Z",
      }),
      payment({
        amount: 0.5,
        routeName: "Ruta actual",
        processedAt: "2026-07-24T04:34:00Z",
      }),
    ]);

    expect(result[0].amount).toBe(0.5);
    expect(result[0].routeName).toBe("Ruta actual");
  });

  it("excludes NFC payments", () => {
    expect(groupQrUnits([payment({ method: "NFC" })])).toEqual([]);
  });

  it("excludes PLACETOPAY payments", () => {
    expect(groupQrUnits([payment({ method: "PLACETOPAY" })])).toEqual([]);
  });

  it("excludes unknown methods and records without busCode", () => {
    expect(
      groupQrUnits([
        payment({ method: "UNKNOWN" }),
        payment({ busCode: null }),
        payment({ busCode: "  " }),
      ])
    ).toEqual([]);
  });

  it("maps null route and missing driver data safely", () => {
    const result = groupQrUnits([payment({ routeName: null })]);

    expect(result[0].routeName).toBe("Sin ruta");
    expect(result[0].driverName).toBe("Sin información");
  });

  it("sorts units by busCode", () => {
    const result = groupQrUnits([
      payment({ busCode: "BUS-20" }),
      payment({ busCode: "BUS-01" }),
    ]);

    expect(result.map((unit) => unit.code)).toEqual(["BUS-01", "BUS-20"]);
  });
});
