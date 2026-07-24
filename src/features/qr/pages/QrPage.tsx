import { useEffect, useMemo, useState } from "react";
import { qrService } from "../services/qr.service";
import type { QrUnitView } from "../types/qr.types";

const PAGE_SIZE = 10;

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export default function QrPage() {
  const [units, setUnits] = useState<QrUnitView[]>([]);
  const [page, setPage] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError("");
    setUnits([]);

    qrService
      .getQrUnits()
      .then((result) => {
        if (!active) {
          return;
        }

        setUnits(result);
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
            : "No se pudieron cargar las unidades QR."
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

  const activeUnits = units.filter((unit) => unit.active).length;
  const inactiveUnits = units.filter((unit) => !unit.active).length;
  const averageFare = useMemo(() => {
    if (units.length === 0) {
      return 0;
    }

    return units.reduce((total, unit) => total + unit.amount, 0) / units.length;
  }, [units]);
  const totalPages = Math.ceil(units.length / PAGE_SIZE);
  const visibleUnits = units.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const refresh = () => {
    setRefreshVersion((current) => current + 1);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR</h1>
          <p className="text-sm text-slate-500">
            Gestión administrativa de unidades habilitadas para pago con código
            QR.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
        >
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Unidades QR" value={String(units.length)} />
        <SummaryCard
          label="Activas"
          value={String(activeUnits)}
          valueClass="text-green-700"
        />
        <SummaryCard label="Inactivas" value={String(inactiveUnits)} />
        <SummaryCard
          label="Tarifa promedio"
          value={formatCurrency(averageFare)}
        />
      </div>

      {isLoading && (
        <div
          aria-label="Cargando unidades QR"
          className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
        >
          Cargando unidades QR...
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

      {!isLoading && !error && units.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Aún no existen unidades registradas por pagos QR.
        </div>
      )}

      {!isLoading && !error && units.length > 0 && (
        <>
          <QrUnitsTable units={visibleUnits} />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <p>
              Página {page + 1} de {totalPages} · {units.length} unidades
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

function QrUnitsTable({ units }: { units: QrUnitView[] }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Unidades detectadas desde pagos QR reales
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Unidad</th>
              <th className="px-4 py-3 font-medium">Ruta</th>
              <th className="px-4 py-3 font-medium">Conductor</th>
              <th className="px-4 py-3 font-medium">Tarifa</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>

          <tbody>
            {units.map((unit) => (
              <tr
                key={unit.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {unit.code}
                </td>
                <td className="px-4 py-3">{unit.busLabel}</td>
                <td className="px-4 py-3">{unit.routeName}</td>
                <td className="px-4 py-3">{unit.driverName}</td>
                <td className="px-4 py-3">
                  {formatCurrency(unit.amount, unit.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                      unit.active
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {unit.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
