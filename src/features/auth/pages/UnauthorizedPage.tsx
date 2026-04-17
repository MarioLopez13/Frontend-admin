import { Link } from "react-router-dom";
import { routes } from "@/app/config/routes";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-500">
          No tienes permisos para acceder a esta sección.
        </p>

        <Link
          to={routes.dashboard}
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}