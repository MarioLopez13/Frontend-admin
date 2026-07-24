import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/core/api/apiClient";
import { endpoints } from "@/core/api/endpoints";
import {
  dashboardService,
  DEFAULT_DASHBOARD_DAYS,
} from "./dashboard.service";

vi.mock("@/core/api/apiClient", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/core/api/apiClient")>();

  return {
    ...original,
    apiClient: vi.fn(),
  };
});

const apiClientMock = vi.mocked(apiClient);

const usersResponse = {
  success: true,
  message: "Resumen",
  data: {
    totalUsers: 6,
    activeUsers: 4,
    inactiveUsers: 0,
    deletedUsers: 2,
  },
};

const transactionsResponse = {
  success: true,
  message: "Resumen",
  data: {
    totalTransactions: 13,
    completedTransactions: 13,
    pendingTransactions: 0,
    failedTransactions: 0,
    refundedTransactions: 0,
    approvedAmount: 64.75,
    operationsByMethod: {
      TRANSFER: 2,
      NFC: 1,
      QR: 3,
      PLACETOPAY: 4,
    },
    dailyOperations: [{ date: "2026-07-23", count: 13 }],
  },
};

describe("dashboardService", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
  });

  it("requests both real endpoints in parallel with days=7", async () => {
    apiClientMock
      .mockResolvedValueOnce(usersResponse)
      .mockResolvedValueOnce(transactionsResponse);

    await dashboardService.getSummary();

    expect(apiClientMock).toHaveBeenCalledTimes(2);
    expect(apiClientMock).toHaveBeenNthCalledWith(
      1,
      endpoints.users.summary
    );
    expect(apiClientMock).toHaveBeenNthCalledWith(
      2,
      `${endpoints.transactions.dashboard}?days=${DEFAULT_DASHBOARD_DAYS}`
    );
    expect(DEFAULT_DASHBOARD_DAYS).toBe(7);
  });

  it("extracts response.data and returns a clean view model", async () => {
    apiClientMock
      .mockResolvedValueOnce(usersResponse)
      .mockResolvedValueOnce(transactionsResponse);

    const result = await dashboardService.getSummary();

    expect(result.userSummary).toEqual(usersResponse.data);
    expect(result.transactionSummary).toEqual(transactionsResponse.data);
    expect(result.operationsByMethod.map((item) => item.method)).toEqual([
      "QR",
      "NFC",
      "PLACETOPAY",
      "TRANSFER",
    ]);
    expect(result.dailyOperations).toEqual([
      { date: "2026-07-23", operations: 13 },
    ]);
  });

  it("returns a controlled authorization error", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Forbidden", { status: 403 })
    );

    await expect(dashboardService.getSummary()).rejects.toThrow(
      "No tiene autorización para consultar el Dashboard."
    );
  });

  it("returns a friendly message for server failures", async () => {
    apiClientMock.mockRejectedValue(
      new ApiError("Internal details", { status: 500 })
    );

    await expect(dashboardService.getSummary()).rejects.toThrow(
      "No fue posible cargar el Dashboard. Intente nuevamente."
    );
  });
});
