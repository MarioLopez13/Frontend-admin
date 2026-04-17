import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/store/auth/auth.store";
import {
  dashboardService,
  type DashboardSummary,
} from "../services/dashboard.service";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
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
            : "No se pudo cargar el resumen del dashboard.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Resumen operativo del núcleo administrativo de Sprint 1.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">Sesión actual</p>
          <p className="text-slate-600">{user?.fullName ?? "-"}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rol: {user?.role ?? "-"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Cargando resumen...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total usuarios</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {summary?.totalUsers ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Usuarios activos</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {summary?.activeUsers ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Usuarios inactivos</p>
            <p className="mt-2 text-3xl font-bold text-slate-700">
              {summary?.inactiveUsers ?? 0}
            </p>
          </article>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Estado de Sprint 1 en admin
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Estructura base del sistema",
              "Autenticación y sesión",
              "Roles y permisos",
              "Gestión básica de usuarios",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Accesos rápidos
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              to={routes.users}
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Ir a gestión de usuarios
            </Link>
            <Link
              to={routes.payments}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver módulo de pagos
            </Link>
            <Link
              to={routes.qr}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver módulo QR
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}