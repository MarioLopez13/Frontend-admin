import { mockPayments } from "@/mocks/payments";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function getStatusLabel(status: "APPROVED" | "PENDING" | "FAILED") {
  switch (status) {
    case "APPROVED":
      return "Aprobado";
    case "PENDING":
      return "Pendiente";
    case "FAILED":
      return "Fallido";
    default:
      return status;
  }
}

function getStatusClass(status: "APPROVED" | "PENDING" | "FAILED") {
  switch (status) {
    case "APPROVED":
      return "border-green-200 bg-green-50 text-green-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function PaymentsPage() {
  const approved = mockPayments.filter(
    (payment) => payment.status === "APPROVED"
  ).length;
  const pending = mockPayments.filter(
    (payment) => payment.status === "PENDING"
  ).length;
  const failed = mockPayments.filter(
    (payment) => payment.status === "FAILED"
  ).length;
  const totalAmount = mockPayments
    .filter((payment) => payment.status === "APPROVED")
    .reduce((acc, payment) => acc + payment.amount, 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
        <p className="text-sm text-slate-500">
          Vista administrativa base del módulo de pagos, preparada con datos mock
          para integración posterior.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Transacciones</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {mockPayments.length}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Aprobadas</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{approved}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{pending}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Monto aprobado</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Estado del módulo
          </h2>
          <p className="text-sm text-slate-500">
            Esta pantalla queda integrada al admin como base funcional de Sprint
            1. La conexión real a backend y filtros avanzados pertenecen a
            sprints posteriores.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Estructura visual integrada
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Datos mock consistentes
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Backend real pendiente
          </div>
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Últimas transacciones mock
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
              {mockPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-slate-100 text-sm text-slate-700"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {payment.id}
                  </td>
                  <td className="px-4 py-3">{payment.busLabel}</td>
                  <td className="px-4 py-3">{payment.routeName}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{payment.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {failed > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Existen transacciones fallidas en datos mock. Esto ayuda a validar
          estados visuales desde el admin sin depender todavía del backend.
        </div>
      )}
    </section>
  );
}