import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardSummaryViewModel } from "../types/dashboard.types";

const CHART_COLORS = ["#16a34a", "#dc2626", "#94a3b8"];

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatDashboardDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return date;
  }

  const [, year, month, day] = match;
  const localDate = new Date(Number(year), Number(month) - 1, Number(day));

  return new Intl.DateTimeFormat("es-EC", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(localDate);
}

function LoadingSkeleton() {
  return (
    <div aria-label="Cargando Dashboard" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryViewModel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await dashboardService.getSummary();
      setSummary(result);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar el Dashboard. Intente nuevamente.";

      setError(message);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const usersChartData = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      { name: "Activos", value: summary.userSummary.activeUsers },
      { name: "Inactivos", value: summary.userSummary.inactiveUsers },
      { name: "Eliminados", value: summary.userSummary.deletedUsers },
    ];
  }, [summary]);

  const weeklyOperationsData = useMemo(
    () =>
      summary?.dailyOperations.map((operation) => ({
        day: formatDashboardDate(operation.date),
        operations: operation.operations,
      })) ?? [],
    [summary]
  );

  const hasUserChartData = usersChartData.some((item) => item.value > 0);
  const hasOperationsData =
    summary?.operationsByMethod.some((item) => item.operations > 0) ?? false;
  const hasWeeklyData = weeklyOperationsData.some(
    (item) => item.operations > 0
  );
  const totalOperations =
    summary?.operationsByMethod.reduce(
      (total, item) => total + item.operations,
      0
    ) ?? 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Resumen operativo del sistema de pagos QR y NFC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSummary()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-semibold text-red-800">
            No se pudo cargar el Dashboard
          </h2>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadSummary()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && summary && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total usuarios</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {summary.userSummary.totalUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Usuarios activos</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {summary.userSummary.activeUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Usuarios inactivos</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {summary.userSummary.inactiveUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total transacciones</p>
              <p className="mt-2 text-3xl font-bold text-indigo-700">
                {summary.transactionSummary.totalTransactions}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {summary.transactionSummary.completedTransactions} completadas
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Monto aprobado</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {USD_FORMATTER.format(
                  summary.transactionSummary.approvedAmount
                )}
              </p>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.45fr]">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Resumen de operaciones
                </h2>
                <p className="text-sm text-slate-500">
                  Estado consolidado de las transacciones registradas.
                </p>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Completadas",
                    value:
                      summary.transactionSummary.completedTransactions,
                    className: "border-green-200 bg-green-50 text-green-800",
                  },
                  {
                    label: "Pendientes",
                    value: summary.transactionSummary.pendingTransactions,
                    className: "border-amber-200 bg-amber-50 text-amber-800",
                  },
                  {
                    label: "Fallidas",
                    value: summary.transactionSummary.failedTransactions,
                    className: "border-red-200 bg-red-50 text-red-800",
                  },
                  {
                    label: "Reembolsadas",
                    value: summary.transactionSummary.refundedTransactions,
                    className: "border-blue-200 bg-blue-50 text-blue-800",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border px-4 py-3 ${item.className}`}
                  >
                    <dt className="text-sm font-medium">{item.label}</dt>
                    <dd className="mt-1 text-2xl font-bold">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Distribución de usuarios
                  </h2>
                  <p className="text-sm text-slate-500">
                    Usuarios activos, inactivos y eliminados.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Datos reales
                </span>
              </div>

              <div className="mt-4 h-72">
                {hasUserChartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usersChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        innerRadius={48}
                        paddingAngle={4}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {usersChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
                    No existen usuarios para mostrar.
                  </div>
                )}
              </div>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Operaciones por método
                  </h2>
                  <p className="text-sm text-slate-500">
                    Distribución por método entregada por Transaction Service.
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {totalOperations} operaciones
                </span>
              </div>

              <div className="mt-4 h-72">
                {hasOperationsData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.operationsByMethod}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="method" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="operations"
                        name="Operaciones"
                        radius={[8, 8, 0, 0]}
                        fill="#4f46e5"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
                    No existen operaciones registradas.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Actividad semanal
                  </h2>
                  <p className="text-sm text-slate-500">
                    Operaciones registradas durante los últimos siete días.
                  </p>
                </div>

                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  Datos reales
                </span>
              </div>

              <div className="mt-4 h-72">
                {hasWeeklyData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyOperationsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="operations"
                        name="Operaciones"
                        stroke="#0891b2"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
                    No existen operaciones durante los últimos siete días.
                  </div>
                )}
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
