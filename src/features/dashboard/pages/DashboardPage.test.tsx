import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardSummaryViewModel } from "../types/dashboard.types";
import DashboardPage, { formatDashboardDate } from "./DashboardPage";

vi.mock("../services/dashboard.service", () => ({
  dashboardService: {
    getSummary: vi.fn(),
  },
}));

type ChartProps = {
  children?: ReactNode;
  data?: unknown;
};

vi.mock("recharts", () => {
  const Chart = ({ children, data }: ChartProps) => (
    <div>
      {data ? JSON.stringify(data) : null}
      {children}
    </div>
  );
  const Element = ({ children, data }: ChartProps) => (
    <div>
      {data ? JSON.stringify(data) : null}
      {children}
    </div>
  );

  return {
    Bar: Element,
    BarChart: Chart,
    CartesianGrid: Element,
    Cell: Element,
    Legend: Element,
    Line: Element,
    LineChart: Chart,
    Pie: Element,
    PieChart: Chart,
    ResponsiveContainer: Element,
    Tooltip: Element,
    XAxis: Element,
    YAxis: Element,
  };
});

const getSummaryMock = vi.mocked(dashboardService.getSummary);

const summary: DashboardSummaryViewModel = {
  userSummary: {
    totalUsers: 6,
    activeUsers: 4,
    inactiveUsers: 0,
    deletedUsers: 2,
  },
  transactionSummary: {
    totalTransactions: 13,
    completedTransactions: 13,
    pendingTransactions: 0,
    failedTransactions: 0,
    refundedTransactions: 0,
    approvedAmount: 64.75,
    operationsByMethod: {
      QR: 3,
      NFC: 1,
      PLACETOPAY: 2,
    },
    dailyOperations: [{ date: "2026-07-23", count: 13 }],
  },
  operationsByMethod: [
    { method: "QR", operations: 3 },
    { method: "NFC", operations: 1 },
    { method: "PLACETOPAY", operations: 2 },
  ],
  dailyOperations: [{ date: "2026-07-23", operations: 13 }],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    getSummaryMock.mockReset();
  });

  it("shows a loading state without false zero metrics", () => {
    getSummaryMock.mockReturnValue(new Promise(() => undefined));

    render(<DashboardPage />);

    expect(screen.getByLabelText("Cargando Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Total usuarios")).not.toBeInTheDocument();
  });

  it("renders backend metrics, dynamic methods and daily operations", async () => {
    getSummaryMock.mockResolvedValue(summary);

    render(<DashboardPage />);

    expect(await screen.findByText("Total usuarios")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Usuarios activos")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Usuarios inactivos")).toBeInTheDocument();
        expect(screen.getByText(/Eliminados/)).toBeInTheDocument();
    expect(screen.getByText("Total transacciones")).toBeInTheDocument();
    expect(screen.getByText("$64.75")).toBeInTheDocument();
    expect(screen.getByText("Resumen de operaciones")).toBeInTheDocument();
    expect(screen.getByText("Completadas")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Fallidas")).toBeInTheDocument();
    expect(screen.getByText("Reembolsadas")).toBeInTheDocument();
    expect(screen.getByText(/PLACETOPAY/)).toBeInTheDocument();
    expect(screen.getAllByText(/13/).length).toBeGreaterThan(0);
  });

  it("formats YYYY-MM-DD without shifting the calendar day", () => {
    const formatted = formatDashboardDate("2026-07-23");

    expect(formatted).toContain("23");
    expect(formatted).not.toContain("22");
  });

  it("shows controlled empty states", async () => {
    getSummaryMock.mockResolvedValue({
      ...summary,
      userSummary: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        deletedUsers: 0,
      },
      transactionSummary: {
        ...summary.transactionSummary,
        operationsByMethod: {},
        dailyOperations: [],
      },
      operationsByMethod: [],
      dailyOperations: [],
    });

    render(<DashboardPage />);

    expect(
      await screen.findByText("No existen usuarios para mostrar.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No existen operaciones registradas.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No existen operaciones durante los últimos siete días."
      )
    ).toBeInTheDocument();
  });

  it("shows an error and retries both dashboard requests", async () => {
    getSummaryMock
      .mockRejectedValueOnce(new Error("Servicio temporalmente no disponible."))
      .mockResolvedValueOnce(summary);

    render(<DashboardPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Servicio temporalmente no disponible."
    );

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Total usuarios")).toBeInTheDocument();
    expect(getSummaryMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes without reloading the page", async () => {
    getSummaryMock.mockResolvedValue(summary);

    render(<DashboardPage />);
    await screen.findByText("Total usuarios");

    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    await waitFor(() => {
      expect(getSummaryMock).toHaveBeenCalledTimes(2);
    });
  });
});
