import { mockQrUnits } from "@/mocks/qrUnits";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function QrPage() {
  const activeUnits = mockQrUnits.filter((unit) => unit.active).length;
  const inactiveUnits = mockQrUnits.filter((unit) => !unit.active).length;
  const averageFare =
    mockQrUnits.length > 0
      ? mockQrUnits.reduce((acc, unit) => acc + unit.amount, 0) /
        mockQrUnits.length
      : 0;

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
          <p className="text-sm text-slate-500">Unidades QR</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {mockQrUnits.length}
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
            Unidades configuradas
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
              {mockQrUnits.map((unit) => (
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
                  <td className="px-4 py-3">{formatCurrency(unit.amount)}</td>
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
    </section>
  );
}