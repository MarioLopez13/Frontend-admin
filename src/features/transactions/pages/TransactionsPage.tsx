import { useEffect, useMemo, useState } from "react";
import { transactionsService } from "../services/transactions.service";
import type {
  TransactionFilters,
  TransactionStatus,
  TransactionView,
} from "../types/transaction.types";

const initialFilters: TransactionFilters = {
  search: "",
  status: "all",
  method: "all",
  dateFrom: "",
  dateTo: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: TransactionStatus) {
  switch (status) {
    case "APPROVED":
      return "Aprobada";
    case "PENDING":
      return "Pendiente";
    case "FAILED":
      return "Fallida";
    case "CANCELLED":
      return "Cancelada";
    default:
      return status;
  }
}

function getStatusClass(status: TransactionStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    case "CANCELLED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getMethodClass(method: "QR" | "NFC") {
  return method === "QR"
    ? "border-blue-200 bg-blue-50 text-blue-700"
    : "border-violet-200 bg-violet-50 text-violet-700";
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async (nextFilters: TransactionFilters) => {
    try {
      setIsLoading(true);
      setError("");
      const result = await transactionsService.getTransactions(nextFilters);
      setTransactions(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las transacciones.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions(filters);
  }, [filters]);

  const summary = useMemo(() => {
    const approved = transactions.filter(
      (transaction) => transaction.status === "APPROVED"
    );
    const pending = transactions.filter(
      (transaction) => transaction.status === "PENDING"
    );
    const failed = transactions.filter(
      (transaction) => transaction.status === "FAILED"
    );

    return {
      total: transactions.length,
      approved: approved.length,
      pending: pending.length,
      failed: failed.length,
      approvedAmount: approved.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      ),
    };
  }, [transactions]);

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-800 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
              SmartPayUT
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Gestión de transacciones
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Consulta administrativa para visualizar pagos QR/NFC, estados,
              usuarios, rutas y trazabilidad operativa.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right">
            <p className="text-sm text-indigo-100">Monto aprobado</p>
            <p className="mt-1 text-3xl font-bold">
              {formatCurrency(summary.approvedAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Transacciones</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.total}
          </p>
        </article>

        <article className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Aprobadas</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {summary.approved}
          </p>
        </article>

        <article className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {summary.pending}
          </p>
        </article>

        <article className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Fallidas</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {summary.failed}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Buscar</span>
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Usuario, correo, bus, ruta o referencia"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Estado</span>
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value as TransactionFilters["status"]
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="APPROVED">Aprobada</option>
              <option value="PENDING">Pendiente</option>
              <option value="FAILED">Fallida</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Método</span>
            <select
              value={filters.method}
              onChange={(event) =>
                updateFilter(
                  "method",
                  event.target.value as TransactionFilters["method"]
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="QR">QR</option>
              <option value="NFC">NFC</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Desde</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Hasta</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </label>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          Cargando transacciones...
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">
            No se encontraron transacciones.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ajusta los filtros para ampliar la búsqueda.
          </p>
        </div>
      ) : (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Transacciones registradas
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Referencia</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Unidad / Ruta</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Monto</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {transaction.reference}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {transaction.userName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.userEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {transaction.busLabel}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.routeName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getMethodClass(
                          transaction.method
                        )}`}
                      >
                        {transaction.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
                  Detalle de transacción
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedTransaction.reference}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <DetailItem label="Usuario" value={selectedTransaction.userName} />
              <DetailItem label="Correo" value={selectedTransaction.userEmail} />
              <DetailItem label="Método" value={selectedTransaction.method} />
              <DetailItem
                label="Estado"
                value={getStatusLabel(selectedTransaction.status)}
              />
              <DetailItem label="Bus" value={selectedTransaction.busLabel} />
              <DetailItem label="Ruta" value={selectedTransaction.routeName} />
              <DetailItem
                label="Monto"
                value={formatCurrency(selectedTransaction.amount)}
              />
              <DetailItem
                label="Fecha"
                value={formatDate(selectedTransaction.createdAt)}
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Descripción
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedTransaction.description}
              </p>

              {selectedTransaction.technicalMessage && (
                <>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    Observación
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedTransaction.technicalMessage}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
