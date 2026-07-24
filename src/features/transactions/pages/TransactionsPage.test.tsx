import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TransactionsPage from "./TransactionsPage";
import { transactionsService } from "../services/transactions.service";
import type {
  AdminTransactionPage,
  AdminTransactionView,
} from "../types/transaction.types";

vi.mock("../services/transactions.service", () => ({
  transactionsService: {
    getAdminTransactions: vi.fn(),
  },
}));

const getTransactionsMock = vi.mocked(
  transactionsService.getAdminTransactions
);

function item(
  overrides: Partial<AdminTransactionView> = {}
): AdminTransactionView {
  return {
    id: "transaction-1",
    correlationId: "correlation-1",
    type: "PAYMENT",
    typeLabel: "Pago",
    method: "QR",
    methodLabel: "QR",
    status: "COMPLETED",
    statusLabel: "Completada",
    amount: 0.35,
    occurredAt: "2026-07-24T04:34:00Z",
    userId: "user-1",
    userLabel: "user-1",
    walletId: "wallet-1",
    busCode: "BUS-01",
    busLabel: "BUS-01",
    routeName: "Ruta Centro",
    routeLabel: "Ruta Centro",
    balanceBefore: 5,
    balanceAfter: 4.65,
    currency: "USD",
    failureReason: null,
    ...overrides,
  };
}

function page(
  overrides: Partial<AdminTransactionPage> = {}
): AdminTransactionPage {
  return {
    items: [item()],
    page: 0,
    pageSize: 20,
    totalElements: 21,
    totalPages: 2,
    ...overrides,
  };
}

describe("TransactionsPage", () => {
  beforeEach(() => {
    getTransactionsMock.mockReset();
  });

  it("shows loading without stale table data", () => {
    getTransactionsMock.mockReturnValue(new Promise(() => undefined));

    render(<TransactionsPage />);

    expect(screen.getByLabelText("Cargando transacciones")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders real transaction columns and data", async () => {
    getTransactionsMock.mockResolvedValue(page());

    render(<TransactionsPage />);

    expect(await screen.findByText("Ruta Centro")).toBeInTheDocument();
    expect(screen.getAllByText("Pago")).toHaveLength(2);
    expect(screen.getAllByText("Completada")).toHaveLength(2);
    expect(screen.getByText("23 jul 2026, 23:34")).toBeInTheDocument();
    expect(getTransactionsMock).toHaveBeenCalledWith({
      page: 0,
      pageSize: 20,
    });
  });

  it("uses backend pagination for previous and next", async () => {
    getTransactionsMock
      .mockResolvedValueOnce(page())
      .mockResolvedValueOnce(page({ page: 1, items: [item({ id: "page-2" })] }));

    render(<TransactionsPage />);

    const next = await screen.findByRole("button", { name: "Siguiente" });
    const previous = screen.getByRole("button", { name: "Anterior" });

    expect(previous).toBeDisabled();
    fireEvent.click(next);

    await waitFor(() => {
      expect(getTransactionsMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
      });
    });
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
  });

  it("shows the empty state", async () => {
    getTransactionsMock.mockResolvedValue(
      page({ items: [], totalElements: 0, totalPages: 0 })
    );

    render(<TransactionsPage />);

    expect(
      await screen.findByText("No existen transacciones registradas.")
    ).toBeInTheDocument();
  });

  it("shows a controlled error and retries the current page", async () => {
    getTransactionsMock
      .mockRejectedValueOnce(new Error("Acceso no autorizado."))
      .mockResolvedValueOnce(page());

    render(<TransactionsPage />);

    expect(await screen.findByText("Acceso no autorizado.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Ruta Centro")).toBeInTheDocument();
    expect(getTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getTransactionsMock).toHaveBeenLastCalledWith({
      page: 0,
      pageSize: 20,
    });
  });

  it("refreshes the current page without reloading the application", async () => {
    getTransactionsMock.mockResolvedValue(page());

    render(<TransactionsPage />);

    await screen.findByText("Ruta Centro");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    await waitFor(() => expect(getTransactionsMock).toHaveBeenCalledTimes(2));
    expect(getTransactionsMock).toHaveBeenLastCalledWith({
      page: 0,
      pageSize: 20,
    });
  });
});
