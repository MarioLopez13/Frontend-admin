import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { getAdminPayments } from "./payments.service";
import type { AdminPayment } from "../types/payment.types";

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
  method: string | null
): AdminPayment {
  return {
    id,
    transactionId: `transaction-${id}`,
    userId: "user-1",
    method,
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
  };
}

describe("payments service", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
  });

  it("uses the authenticated real endpoint and extracts response.data", async () => {
    apiClientMock.mockResolvedValue({
      success: true,
      message: "Pagos consultados correctamente.",
      data: [
        payment("qr", "QR"),
        payment("nfc", "NFC"),
        payment("top-up", "PLACETOPAY"),
        payment("other", null),
      ],
    });

    const result = await getAdminPayments();

    expect(apiClientMock).toHaveBeenCalledWith(endpoints.payments.admin);
    expect(result.map((item) => item.id)).toEqual(["qr", "nfc"]);
  });

  it("returns a controlled permission message for HTTP 403", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Forbidden", { status: 403 })
    );

    await expect(getAdminPayments()).rejects.toThrow(
      "No tienes permisos para consultar los pagos."
    );
  });

  it("returns a controlled missing resource message for HTTP 404", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Not found", { status: 404 })
    );

    await expect(getAdminPayments()).rejects.toThrow(
      "No se encontró el recurso administrativo de pagos."
    );
  });

  it("does not use fetch, query parameters or legacy routes", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    apiClientMock.mockResolvedValue({
      success: true,
      message: "Pagos consultados correctamente.",
      data: [],
    });

    await getAdminPayments();

    const requestedPath = apiClientMock.mock.calls[0][0];
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(requestedPath).toBe("/payments");
    expect(requestedPath).not.toContain("mobile-payments");
    expect(requestedPath).not.toContain("?");

    fetchSpy.mockRestore();
  });
});
