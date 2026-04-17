import { useNavigate } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/store/auth/auth.store";

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(routes.login, { replace: true });
  };

  return (
    <header className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Panel de control</h2>
        <p className="text-sm text-slate-500">
          Gestión administrativa del sistema
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {user?.fullName ?? "Usuario"}
          </p>
          <p className="text-xs uppercase text-slate-500">
            {user?.role ?? "-"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}