import { useEffect, useMemo, useState } from "react";
import { exportCsv } from "@/shared/utils/exportCsv";
import { formatPaymentDate } from "../services/payments.adapter";
import { paymentsService } from "../services/payments.service";
import type { AdminPaymentView } from "../types/payment.types";

const PAGE_SIZE = 10;

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
      return "border-green-200 bg-green-50 text-green-700";
    case "PENDING":
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    case "REFUNDED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentView[]>([]);
  const [page, setPage] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError("");
    setPayments([]);

    paymentsService
      .getAdminPayments()
      .then((result) => {
        if (!active) {
          return;
        }

        setPayments(result);
        setPage((current) => {
          const lastPage = Math.max(0, Math.ceil(result.length / PAGE_SIZE) - 1);
          return Math.min(current, lastPage);
        });
      })
      .catch((requestError: unknown) => {
        if (!active) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron cargar los pagos."
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
  }, [refreshVersion]);

  const completed = useMemo(
    () => payments.filter((payment) => payment.paymentStatus === "COMPLETED"),
    [payments]
  );
  const pending = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.paymentStatus === "PENDING" ||
          payment.paymentStatus === "PROCESSING"
      ),
    [payments]
  );
  const totalAmount = useMemo(
    () => completed.reduce((total, payment) => total + payment.amount, 0),
    [completed]
  );
  const totalPages = Math.ceil(payments.length / PAGE_SIZE);
  const visiblePayments = payments.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const handleExportPayments = () => {
    exportCsv(
      "smartpayut_pagos",
      payments.map((payment) => ({
        ID: payment.id,
        Usuario: payment.userLabel,
        Unidad: payment.busLabel,
        Ruta: payment.routeLabel,
        Método: payment.methodLabel,
        Monto: payment.amount.toFixed(2),
        Estado: payment.statusLabel,
        Fecha: formatPaymentDate(payment.processedAt),
      })),
      "No existen pagos para exportar."
    );
  };

  const refresh = () => {
    setRefreshVersion((current) => current + 1);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
          <p className="text-sm text-slate-500">
            Monitoreo administrativo de pagos QR y NFC registrados en el
            sistema.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={handleExportPayments}
            disabled={isLoading || payments.length === 0}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-60"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total de pagos" value={String(payments.length)} />
        <SummaryCard
          label="Completados"
          value={String(completed.length)}
          valueClass="text-green-700"
        />
        <SummaryCard
          label="Pendientes"
          value={String(pending.length)}
          valueClass="text-amber-700"
        />
        <SummaryCard
          label="Monto completado"
          value={formatCurrency(totalAmount)}
        />
      </div>

      {isLoading && (
        <div
          aria-label="Cargando pagos"
          className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
        >
          Cargando pagos...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && payments.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No existen pagos QR o NFC registrados.
        </div>
      )}

      {!isLoading && !error && payments.length > 0 && (
        <>
          <PaymentsTable payments={visiblePayments} />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <p>
              Página {page + 1} de {totalPages} · {payments.length} pagos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages - 1, current + 1)
                  )
                }
                disabled={page + 1 >= totalPages}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
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
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
    </article>
  );
}

function PaymentsTable({ payments }: { payments: AdminPaymentView[] }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Últimos pagos
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Unidad</th>
              <th className="px-4 py-3 font-medium">Ruta</th>
              <th className="px-4 py-3 font-medium">Método</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="max-w-48 truncate px-4 py-3 font-mono text-xs font-medium text-slate-900">
                  {payment.id}
                </td>
                <td className="px-4 py-3">{payment.busLabel}</td>
                <td className="px-4 py-3">{payment.routeLabel}</td>
                <td className="px-4 py-3">{payment.methodLabel}</td>
                <td className="px-4 py-3">
                  {formatCurrency(payment.amount, payment.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      payment.paymentStatus
                    )}`}
                  >
                    {payment.statusLabel}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatPaymentDate(payment.processedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
