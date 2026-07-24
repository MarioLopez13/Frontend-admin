import { useEffect, useMemo, useState } from "react";
import { exportCsv } from "@/shared/utils/exportCsv";
import {
  formatTransactionDate,
} from "../services/transactions.adapter";
import { transactionsService } from "../services/transactions.service";
import type {
  AdminTransactionPage,
  AdminTransactionView,
  TransactionFilters,
} from "../types/transaction.types";

const initialFilters: TransactionFilters = {
  search: "",
  status: "all",
  method: "all",
  type: "all",
  dateFrom: "",
  dateTo: "",
};

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    case "REFUNDED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getMethodClass(method: string | null) {
  switch (method?.toUpperCase()) {
    case "QR":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "NFC":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "PLACETOPAY":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function localDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Guayaquil",
  }).format(date);
}

function matchesFilters(
  transaction: AdminTransactionView,
  filters: TransactionFilters
) {
  const query = filters.search.trim().toLowerCase();
  const transactionDate = localDateKey(transaction.occurredAt);
  const searchable = [
    transaction.id,
    transaction.userId,
    transaction.walletId,
    transaction.busCode,
    transaction.routeName,
    transaction.type,
    transaction.typeLabel,
    transaction.method,
    transaction.methodLabel,
    transaction.status,
    transaction.statusLabel,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return (
    (!query || searchable.includes(query)) &&
    (filters.status === "all" || transaction.status === filters.status) &&
    (filters.method === "all" || transaction.method === filters.method) &&
    (filters.type === "all" || transaction.type === filters.type) &&
    (!filters.dateFrom || transactionDate >= filters.dateFrom) &&
    (!filters.dateTo || transactionDate <= filters.dateTo)
  );
}

export default function TransactionsPage() {
  const [data, setData] = useState<AdminTransactionPage | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransactionView | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError("");
    setData(null);
    setSelectedTransaction(null);

    transactionsService
      .getAdminTransactions({ page, pageSize })
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((requestError: unknown) => {
        if (!active) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron cargar las transacciones."
        );
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, pageSize, refreshVersion]);

  const visibleTransactions = useMemo(
    () => (data?.items ?? []).filter((item) => matchesFilters(item, filters)),
    [data, filters]
  );

  const pageSummary = useMemo(() => {
    const completed = visibleTransactions.filter(
      (transaction) => transaction.status === "COMPLETED"
    );

    return {
      completed: completed.length,
      pending: visibleTransactions.filter(
        (transaction) => transaction.status === "PENDING"
      ).length,
      failed: visibleTransactions.filter(
        (transaction) => transaction.status === "FAILED"
      ).length,
      completedAmount: completed.reduce(
        (total, transaction) => total + transaction.amount,
        0
      ),
    };
  }, [visibleTransactions]);

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const refresh = () => {
    setRefreshVersion((current) => current + 1);
  };

  const exportCurrentPage = () => {
    exportCsv(
      "smartpayut_transacciones",
      visibleTransactions.map((transaction) => ({
        Fecha: formatTransactionDate(transaction.occurredAt),
        Tipo: transaction.typeLabel,
        Método: transaction.methodLabel,
        Estado: transaction.statusLabel,
        Monto: transaction.amount.toFixed(2),
        Usuario: transaction.userLabel,
        Bus: transaction.busLabel,
        Ruta: transaction.routeLabel,
      })),
      "No existen transacciones para exportar en la página actual."
    );
  };

  const currentPage = (data?.page ?? page) + 1;
  const totalPages = data?.totalPages ?? 0;
  const isFirstPage = (data?.page ?? page) === 0;
  const isLastPage = totalPages === 0 || currentPage >= totalPages;

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
              Historial consolidado de Transaction Service con pagos, recargas
              y movimientos técnicos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={exportCurrentPage}
              disabled={isLoading || visibleTransactions.length === 0}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 disabled:opacity-60"
            >
              Exportar página
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total registrado"
          value={String(data?.totalElements ?? 0)}
        />
        <SummaryCard
          label="Completadas en página"
          value={String(pageSummary.completed)}
          valueClass="text-emerald-700"
        />
        <SummaryCard
          label="Pendientes / fallidas"
          value={`${pageSummary.pending} / ${pageSummary.failed}`}
          valueClass="text-amber-700"
        />
        <SummaryCard
          label="Monto completado en página"
          value={formatCurrency(pageSummary.completedAmount)}
          valueClass="text-indigo-700"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Los filtros se aplican únicamente a la página actual. El endpoint no
          ofrece filtros globales.
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(3,0.8fr)_repeat(2,0.8fr)_auto]">
          <FilterField label="Buscar">
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Usuario, bus, ruta o identificador"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </FilterField>

          <FilterField label="Tipo">
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="PAYMENT">Pago</option>
              <option value="TOP_UP">Recarga</option>
              <option value="CREDIT">Crédito</option>
              <option value="DEBIT">Débito</option>
              <option value="REFUND">Reembolso</option>
              <option value="WALLET_CREATED">Creación de billetera</option>
            </select>
          </FilterField>

          <FilterField label="Estado">
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="COMPLETED">Completada</option>
              <option value="PENDING">Pendiente</option>
              <option value="FAILED">Fallida</option>
              <option value="REFUNDED">Reembolsada</option>
            </select>
          </FilterField>

          <FilterField label="Método">
            <select
              value={filters.method}
              onChange={(event) => updateFilter("method", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="QR">QR</option>
              <option value="NFC">NFC</option>
              <option value="PLACETOPAY">PlaceToPay</option>
            </select>
          </FilterField>

          <FilterField label="Desde">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </FilterField>

          <FilterField label="Hasta">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </FilterField>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setFilters(initialFilters)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          aria-label="Cargando transacciones"
          className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500"
        >
          Cargando transacciones...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">
            No existen transacciones registradas.
          </p>
        </div>
      ) : visibleTransactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">
            Ninguna transacción de esta página coincide con los filtros.
          </p>
        </div>
      ) : (
        <TransactionTable
          transactions={visibleTransactions}
          onSelect={setSelectedTransaction}
        />
      )}

      {!isLoading && !error && data && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-600">
            {data.totalElements} registros · Página {currentPage} de{" "}
            {Math.max(totalPages, 1)}
          </p>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">
              Filas
              <select
                aria-label="Filas por página"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(0);
                }}
                className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={isFirstPage}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={isLastPage}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
    </article>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TransactionTable({
  transactions,
  onSelect,
}: {
  transactions: AdminTransactionView[];
  onSelect: (transaction: AdminTransactionView) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              {[
                "Fecha",
                "Tipo",
                "Método",
                "Estado",
                "Monto",
                "Usuario",
                "Unidad / Bus",
                "Ruta",
                "Acción",
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  {formatTransactionDate(transaction.occurredAt)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {transaction.typeLabel}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getMethodClass(
                      transaction.method
                    )}`}
                  >
                    {transaction.methodLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      transaction.status
                    )}`}
                  >
                    {transaction.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </td>
                <td className="max-w-52 truncate px-4 py-3 font-mono text-xs">
                  {transaction.userLabel}
                </td>
                <td className="px-4 py-3">{transaction.busLabel}</td>
                <td className="px-4 py-3">{transaction.routeLabel}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelect(transaction)}
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
  );
}

function TransactionDetail({
  transaction,
  onClose,
}: {
  transaction: AdminTransactionView;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Detalle de transacción
            </p>
            <h2 className="mt-1 break-all text-xl font-bold text-slate-900">
              {transaction.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <DetailItem label="Tipo" value={transaction.typeLabel} />
          <DetailItem label="Método" value={transaction.methodLabel} />
          <DetailItem label="Estado" value={transaction.statusLabel} />
          <DetailItem
            label="Monto"
            value={formatCurrency(transaction.amount, transaction.currency)}
          />
          <DetailItem label="Usuario" value={transaction.userLabel} />
          <DetailItem label="Wallet" value={transaction.walletId ?? "—"} />
          <DetailItem label="Bus" value={transaction.busLabel} />
          <DetailItem label="Ruta" value={transaction.routeLabel} />
          <DetailItem
            label="Saldo anterior"
            value={
              transaction.balanceBefore === null
                ? "—"
                : formatCurrency(
                    transaction.balanceBefore,
                    transaction.currency
                  )
            }
          />
          <DetailItem
            label="Saldo posterior"
            value={
              transaction.balanceAfter === null
                ? "—"
                : formatCurrency(transaction.balanceAfter, transaction.currency)
            }
          />
          <DetailItem
            label="Fecha"
            value={formatTransactionDate(transaction.occurredAt)}
          />
          <DetailItem
            label="Correlación"
            value={transaction.correlationId ?? "—"}
          />
        </div>

        {transaction.failureReason && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Motivo del fallo
            </p>
            <p className="mt-1 text-sm text-red-700">
              {transaction.failureReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
