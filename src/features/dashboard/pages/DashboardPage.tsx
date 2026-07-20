import { useEffect, useMemo, useState } from "react";
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
import {
  dashboardService,
  type DashboardSummary,
} from "../services/dashboard.service";

const CHART_COLORS = ["#16a34a", "#dc2626", "#94a3b8"];

const EMPTY_SUMMARY: DashboardSummary = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalTransactions: 0,
  approvedTransactions: 0,
  pendingTransactions: 0,
  failedTransactions: 0,
  approvedAmount: 0,
  operationsByMethod: [],
  weeklyOperations: [],
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await dashboardService.getSummary();
        setSummary(result);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al obtener la información del dashboard.";

        setError(message);
        setSummary(EMPTY_SUMMARY);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, []);

  const totalUsers = summary?.totalUsers ?? 0;
  const activeUsers = summary?.activeUsers ?? 0;
  const inactiveUsers = summary?.inactiveUsers ?? 0;

  const totalTransactions = summary?.totalTransactions ?? 0;
  const approvedTransactions = summary?.approvedTransactions ?? 0;
  const pendingTransactions = summary?.pendingTransactions ?? 0;
  const failedTransactions = summary?.failedTransactions ?? 0;
  const approvedAmount = summary?.approvedAmount ?? 0;

  const operationsByMethodData = summary?.operationsByMethod ?? [];
  const weeklyOperationsData = summary?.weeklyOperations ?? [];

  const hasUserChartData = totalUsers > 0;
  const hasOperationsData = operationsByMethodData.some(
    (item) => item.operations > 0
  );
  const hasWeeklyData = weeklyOperationsData.some(
    (item) => item.operations > 0
  );

  const usersChartData = useMemo(() => {
    if (!hasUserChartData) {
      return [{ name: "Sin datos", value: 1 }];
    }

    return [
      { name: "Activos", value: activeUsers },
      { name: "Inactivos", value: inactiveUsers },
    ];
  }, [activeUsers, inactiveUsers, hasUserChartData]);

  const totalOperations = operationsByMethodData.reduce(
    (acc, item) => acc + item.operations,
    0
  );

  const operationalStatus = [
    {
      label: "Autenticación disponible",
      ok: !error,
    },
    {
      label: `${totalUsers} usuarios gestionados`,
      ok: !error,
    },
    {
      label: `${approvedTransactions} transacciones aprobadas`,
      ok: !error,
    },
    {
      label: `${pendingTransactions} pendientes y ${failedTransactions} fallidas`,
      ok: !error,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Resumen operativo del sistema de pagos QR y NFC.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          Cargando resumen...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total usuarios</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Usuarios activos</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {activeUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Usuarios inactivos</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {inactiveUsers}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total transacciones</p>
              <p className="mt-2 text-3xl font-bold text-indigo-700">
                {totalTransactions}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {approvedTransactions} aprobadas
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Monto aprobado</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                ${approvedAmount.toFixed(2)}
              </p>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.45fr]">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Estado operativo
                  </h2>
                  <p className="text-sm text-slate-500">
                    Validación rápida de los módulos principales.
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    error
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {error ? "Con alertas" : "Operativo"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {operationalStatus.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                      item.ok
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-800"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Distribución de usuarios
                  </h2>
                  <p className="text-sm text-slate-500">
                    Usuarios activos e inactivos registrados en el sistema.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Datos reales
                </span>
              </div>

              <div className="mt-4 h-72">
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
                      paddingAngle={hasUserChartData ? 4 : 0}
                      label={({ name, value }) =>
                        hasUserChartData ? `${name}: ${value}` : "Sin datos"
                      }
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
                    Comparación de pagos registrados mediante QR y NFC.
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {totalOperations} operaciones
                </span>
              </div>

              <div className="mt-4 h-72">
                {hasOperationsData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={operationsByMethodData}>
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

              <p className="mt-2 text-xs text-slate-400">
                Información obtenida directamente del servicio de
                transacciones.
              </p>
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

              <p className="mt-2 text-xs text-slate-400">
                Tendencia calculada con las transacciones reales del sistema.
              </p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
//Prueba para deploy