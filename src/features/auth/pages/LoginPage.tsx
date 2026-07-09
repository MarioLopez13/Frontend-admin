import { Navigate } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/store/auth/auth.store";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Cargando acceso
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Verificando si existe una sesión activa.
          </p>
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">KynSoft</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            SmartPayUT Admin
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa con tus credenciales para acceder al panel administrativo.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}