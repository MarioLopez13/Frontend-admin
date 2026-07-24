import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QrPage from "./QrPage";
import { qrService } from "../services/qr.service";
import type { QrUnitView } from "../types/qr.types";

vi.mock("../services/qr.service", () => ({
  qrService: {
    getQrUnits: vi.fn(),
  },
}));

const getQrUnitsMock = vi.mocked(qrService.getQrUnits);

function unit(
  index: number,
  overrides: Partial<QrUnitView> = {}
): QrUnitView {
  return {
    id: `BUS-${index}`,
    code: `BUS-${index}`,
    busLabel: `Unidad BUS-${index}`,
    routeName: `Ruta ${index}`,
    driverName: "Sin información",
    amount: 0.35,
    currency: "USD",
    active: true,
    lastPaymentAt: "2026-07-24T04:34:00Z",
    ...overrides,
  };
}

describe("QrPage", () => {
  beforeEach(() => {
    getQrUnitsMock.mockReset();
  });

  it("shows loading without a stale table", () => {
    getQrUnitsMock.mockReturnValue(new Promise(() => undefined));

    render(<QrPage />);

    expect(screen.getByLabelText("Cargando unidades QR")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders grouped QR units and summary cards", async () => {
    getQrUnitsMock.mockResolvedValue([unit(1), unit(2)]);

    render(<QrPage />);

    expect(await screen.findByText("Unidad BUS-1")).toBeInTheDocument();
    expect(screen.getByText("Unidad BUS-2")).toBeInTheDocument();
    expect(screen.getByText("Unidades QR").nextSibling).toHaveTextContent("2");
    expect(screen.getByText("Activas").nextSibling).toHaveTextContent("2");
  });

  it("shows the empty state", async () => {
    getQrUnitsMock.mockResolvedValue([]);

    render(<QrPage />);

    expect(
      await screen.findByText("Aún no existen unidades registradas por pagos QR.")
    ).toBeInTheDocument();
  });

  it("shows a controlled error and retries", async () => {
    getQrUnitsMock
      .mockRejectedValueOnce(
        new Error("No tienes permisos para consultar las unidades QR.")
      )
      .mockResolvedValueOnce([unit(1)]);

    render(<QrPage />);

    expect(
      await screen.findByText(
        "No tienes permisos para consultar las unidades QR."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Unidad BUS-1")).toBeInTheDocument();
    expect(getQrUnitsMock).toHaveBeenCalledTimes(2);
  });

  it("uses local pagination with ten units per page", async () => {
    getQrUnitsMock.mockResolvedValue(
      Array.from({ length: 11 }, (_, index) => unit(index + 1))
    );

    render(<QrPage />);

    expect(await screen.findByText("Unidad BUS-1")).toBeInTheDocument();
    expect(screen.queryByText("Unidad BUS-11")).not.toBeInTheDocument();

    const previous = screen.getByRole("button", { name: "Anterior" });
    const next = screen.getByRole("button", { name: "Siguiente" });
    expect(previous).toBeDisabled();

    fireEvent.click(next);

    expect(await screen.findByText("Unidad BUS-11")).toBeInTheDocument();
    expect(screen.queryByText("Unidad BUS-1")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
  });

  it("refreshes without reloading the application", async () => {
    getQrUnitsMock.mockResolvedValue([unit(1)]);

    render(<QrPage />);

    await screen.findByText("Unidad BUS-1");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    await waitFor(() => expect(getQrUnitsMock).toHaveBeenCalledTimes(2));
  });
});
