import { Navigate, Outlet } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/store/auth/auth.store";
import type { AppPermission } from "./auth.types";
import { hasPermission } from "./permissions";

type AuthGuardProps = {
  permission?: AppPermission;
};

export default function AuthGuard({ permission }: AuthGuardProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Validando sesión
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Espera un momento mientras se carga el acceso al sistema.
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={routes.login} replace />;
  }

  if (permission && !hasPermission(user.role, permission)) {
    return <Navigate to={routes.unauthorized} replace />;
  }

  return <Outlet />;
}