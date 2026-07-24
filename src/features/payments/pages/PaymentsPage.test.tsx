import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaymentsPage from "./PaymentsPage";
import { paymentsService } from "../services/payments.service";
import type { AdminPaymentView } from "../types/payment.types";

vi.mock("../services/payments.service", () => ({
  paymentsService: {
    getAdminPayments: vi.fn(),
  },
}));

const getPaymentsMock = vi.mocked(paymentsService.getAdminPayments);

function payment(
  index: number,
  overrides: Partial<AdminPaymentView> = {}
): AdminPaymentView {
  return {
    id: `payment-${index}`,
    transactionId: `transaction-${index}`,
    userId: "user-1",
    userLabel: "user-1",
    method: "QR",
    methodLabel: "QR",
    paymentStatus: "COMPLETED",
    status: "Completado",
    statusLabel: "Completado",
    amount: 0.35,
    currency: "USD",
    busCode: `BUS-${index}`,
    busLabel: `BUS-${index}`,
    routeName: `Ruta ${index}`,
    routeLabel: `Ruta ${index}`,
    previousBalance: 5,
    updatedBalance: 4.65,
    processedAt: "2026-07-24T04:34:00Z",
    failureReason: null,
    ...overrides,
  };
}

describe("PaymentsPage", () => {
  beforeEach(() => {
    getPaymentsMock.mockReset();
  });

  it("shows loading without a stale table", () => {
    getPaymentsMock.mockReturnValue(new Promise(() => undefined));

    render(<PaymentsPage />);

    expect(screen.getByLabelText("Cargando pagos")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders payment data, metrics and Ecuador time", async () => {
    getPaymentsMock.mockResolvedValue([
      payment(1),
      payment(2, {
        method: "NFC",
        methodLabel: "NFC",
        paymentStatus: "PENDING",
        statusLabel: "Pendiente",
      }),
    ]);

    render(<PaymentsPage />);

    expect(await screen.findByText("BUS-1")).toBeInTheDocument();
    expect(screen.getByText("BUS-2")).toBeInTheDocument();
    expect(screen.getByText("Total de pagos").nextSibling).toHaveTextContent(
      "2"
    );
    expect(screen.getByText("Completados").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Pendientes").nextSibling).toHaveTextContent("1");
    expect(screen.getAllByText("23 jul 2026, 23:34")).toHaveLength(2);
  });

  it("uses local pagination with ten payments per page", async () => {
    getPaymentsMock.mockResolvedValue(
      Array.from({ length: 11 }, (_, index) => payment(index + 1))
    );

    render(<PaymentsPage />);

    expect(await screen.findByText("BUS-1")).toBeInTheDocument();
    expect(screen.queryByText("BUS-11")).not.toBeInTheDocument();

    const previous = screen.getByRole("button", { name: "Anterior" });
    const next = screen.getByRole("button", { name: "Siguiente" });
    expect(previous).toBeDisabled();

    fireEvent.click(next);

    expect(await screen.findByText("BUS-11")).toBeInTheDocument();
    expect(screen.queryByText("BUS-1")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
  });

  it("shows the empty state", async () => {
    getPaymentsMock.mockResolvedValue([]);

    render(<PaymentsPage />);

    expect(
      await screen.findByText("No existen pagos QR o NFC registrados.")
    ).toBeInTheDocument();
  });

  it("shows a controlled error and retries", async () => {
    getPaymentsMock
      .mockRejectedValueOnce(new Error("No tienes permisos para consultar los pagos."))
      .mockResolvedValueOnce([payment(1)]);

    render(<PaymentsPage />);

    expect(
      await screen.findByText("No tienes permisos para consultar los pagos.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("BUS-1")).toBeInTheDocument();
    expect(getPaymentsMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes without reloading the application", async () => {
    getPaymentsMock.mockResolvedValue([payment(1)]);

    render(<PaymentsPage />);

    await screen.findByText("BUS-1");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    await waitFor(() => expect(getPaymentsMock).toHaveBeenCalledTimes(2));
  });
});
