import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";

type QrUnitView = {
  id: string;
  code: string;
  busLabel: string;
  routeName: string;
  driverName: string;
  amount: number;
  active: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function QrPage() {
  const [units, setUnits] = useState<QrUnitView[]>([]);

  useEffect(() => {
    loadUnitsFromTransactions();
  }, []);

  async function loadUnitsFromTransactions() {
    try {
      const response = await fetch(`${API_BASE_URL}/mobile-payments`);
      const data = await response.json();
      const items = data.items ?? data.data ?? [];

      const unitsMap = new Map<string, QrUnitView>();

      items.forEach((item: any) => {
        const busCode = item.busCode ?? "BUS-DEMO";
        const routeName = item.routeName ?? "Ruta demo";
        const amount = Number(item.amount ?? 0.35);

        if (!unitsMap.has(busCode)) {
          unitsMap.set(busCode, {
            id: busCode,
            code: busCode,
            busLabel: `Unidad ${busCode}`,
            routeName,
            driverName: "Conductor asignado",
            amount,
            active: true,
          });
        }
      });

      setUnits(Array.from(unitsMap.values()));
    } catch (error) {
      console.error(error);
      setUnits([]);
    }
  }

  const activeUnits = units.filter((unit) => unit.active).length;
  const inactiveUnits = units.filter((unit) => !unit.active).length;

  const averageFare = useMemo(() => {
    if (units.length === 0) {
      return 0;
    }

    return units.reduce((acc, unit) => acc + unit.amount, 0) / units.length;
  }, [units]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR</h1>
        <p className="text-sm text-slate-500">
          Gestión administrativa de unidades habilitadas para pago con código QR.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Unidades QR/NFC</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {units.length}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Activas</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {activeUnits}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactivas</p>
          <p className="mt-2 text-3xl font-bold text-slate-700">
            {inactiveUnits}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tarifa promedio</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(averageFare)}
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Unidades detectadas desde transacciones reales
          </h2>
        </div>

        {units.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Aún no existen unidades registradas por pagos QR/NFC.
          </div>
        ) : (
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
                      {formatCurrency(unit.amount)}
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
        )}
      </article>
    </section>
  );
}