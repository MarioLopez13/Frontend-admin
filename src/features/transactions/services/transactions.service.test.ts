import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import { getAdminTransactions } from "./transactions.service";

vi.mock("@/core/api/apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/api/apiClient")>();
  return {
    ...actual,
    apiClient: vi.fn(),
  };
});

const apiClientMock = vi.mocked(apiClient);

const response = {
  success: true,
  message: "Historial administrativo consultado correctamente.",
  data: {
    items: [
      {
        id: "transaction-1",
        correlationId: "correlation-1",
        type: "TOP_UP",
        method: "PLACETOPAY",
        status: "COMPLETED",
        amount: 5,
        occurredAt: "2026-07-24T04:34:00Z",
        userId: "user-1",
        walletId: "wallet-1",
        busCode: "WALLET",
        routeName: "Recarga de saldo",
        balanceBefore: 0,
        balanceAfter: 5,
        currency: "USD",
        failureReason: null,
      },
    ],
    page: 2,
    pageSize: 20,
    totalElements: 45,
    totalPages: 3,
  },
};

describe("transactions service", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
  });

  it("uses the authenticated admin endpoint and extracts data", async () => {
    apiClientMock.mockResolvedValue(response);

    const result = await getAdminTransactions({ page: 2, pageSize: 20 });

    expect(apiClientMock).toHaveBeenCalledWith(
      `${endpoints.transactions.admin}?page=2&pageSize=20`
    );
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.totalElements).toBe(45);
    expect(result.items[0].typeLabel).toBe("Recarga");
    expect(result.items[0].methodLabel).toBe("PlaceToPay");
  });

  it("returns a controlled permission message for HTTP 403", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Forbidden", { status: 403 })
    );

    await expect(
      getAdminTransactions({ page: 0, pageSize: 20 })
    ).rejects.toThrow("No tienes permisos para consultar las transacciones.");
  });

  it("never calls a legacy payment route", async () => {
    apiClientMock.mockResolvedValue(response);

    await getAdminTransactions({ page: 0, pageSize: 10 });

    const requestedPath = apiClientMock.mock.calls[0][0];
    expect(requestedPath).not.toContain("mobile-payments");
    expect(requestedPath).not.toMatch(/^\/payments/);
    expect(requestedPath).not.toContain("transactions/me");
  });
});
