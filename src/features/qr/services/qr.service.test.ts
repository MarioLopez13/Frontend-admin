import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { getQrUnits } from "./qr.service";
import type { QrPayment } from "../types/qr.types";

vi.mock("@/core/api/apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/api/apiClient")>();
  return {
    ...actual,
    apiClient: vi.fn(),
  };
});

const apiClientMock = vi.mocked(apiClient);

function payment(
  id: string,
  method: string,
  busCode: string
): QrPayment {
  return {
    id,
    transactionId: `transaction-${id}`,
    userId: "user-1",
    method,
    paymentStatus: "COMPLETED",
    status: "Completado",
    amount: 0.35,
    currency: "USD",
    busCode,
    routeName: "Ruta Centro",
    previousBalance: 5,
    updatedBalance: 4.65,
    processedAt: "2026-07-24T04:34:00Z",
    failureReason: null,
  };
}

describe("qr service", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
  });

  it("uses the existing payments endpoint and returns grouped QR units", async () => {
    apiClientMock.mockResolvedValue({
      success: true,
      message: "Pagos consultados correctamente.",
      data: [
        payment("qr-1", "QR", "BUS-01"),
        payment("qr-2", "QR", "BUS-01"),
        payment("nfc", "NFC", "BUS-02"),
        payment("top-up", "PLACETOPAY", "WALLET"),
      ],
    });

    const result = await getQrUnits();

    expect(apiClientMock).toHaveBeenCalledWith(endpoints.payments.admin);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("BUS-01");
  });

  it("returns a controlled permission message for HTTP 403", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Forbidden", { status: 403 })
    );

    await expect(getQrUnits()).rejects.toThrow(
      "No tienes permisos para consultar las unidades QR."
    );
  });

  it("returns a controlled missing resource message for HTTP 404", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Not found", { status: 404 })
    );

    await expect(getQrUnits()).rejects.toThrow(
      "No se encontró el recurso de pagos para unidades QR."
    );
  });

  it("does not use fetch, query parameters or legacy routes", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    apiClientMock.mockResolvedValue({
      success: true,
      message: "Pagos consultados correctamente.",
      data: [],
    });

    await getQrUnits();

    const requestedPath = apiClientMock.mock.calls[0][0];
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(requestedPath).toBe("/payments");
    expect(requestedPath).not.toContain("mobile-payments");
    expect(requestedPath).not.toContain("?");

    fetchSpy.mockRestore();
  });
});
