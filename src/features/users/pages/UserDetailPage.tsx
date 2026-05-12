import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { hasPermission } from "@/core/auth/permissions";
import { useAuthStore } from "@/store/auth/auth.store";
import UserDetailCard from "../components/UserDetailCard";
import { usersService } from "../services/users.service";
import type { UserAdminView } from "../types/user-admin.types";

type DetailPageState = {
  feedback?: string;
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((state) => state.user?.role);
  const canEdit = hasPermission(role, "users:edit");
  const canToggleStatus = hasPermission(role, "users:status");

  const routeState = (location.state as DetailPageState | null) ?? null;

  const [user, setUser] = useState<UserAdminView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(routeState?.feedback ?? "");

  const loadUser = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");
      const result = await usersService.getUserById(id);

      if (!result) {
        setError("Usuario no encontrado.");
        return;
      }

      setUser(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el usuario.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, [id]);

  useEffect(() => {
    if (!routeState?.feedback) return;

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, routeState]);

  const handleToggleStatus = async () => {
    if (!user || !canToggleStatus) return;

    const nextStatus = user.status === "active" ? "inactive" : "active";

    try {
      setError("");
      const updated = await usersService.updateUserStatus(user.id, {
        status: nextStatus,
      });
      setUser(updated);
      setFeedback(
        `Estado actualizado: ${updated.fullName} ahora está ${
          updated.status === "active" ? "activo" : "inactivo"
        }.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del usuario.";
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Cargando detalle del usuario...
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Usuario no encontrado."}
        </div>

        <button
          onClick={() => navigate(routes.users)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Volver
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Detalle de usuario
          </h1>
          <p className="text-sm text-slate-500">
            Información completa y acciones principales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to={routes.userEdit(user.id)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              Editar
            </Link>
          )}

          {canToggleStatus && (
            <button
              onClick={handleToggleStatus}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {user.status === "active" ? "Desactivar" : "Activar"}
            </button>
          )}

          <button
            onClick={() => navigate(routes.users)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Volver
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {feedback}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UserDetailCard user={user} />
    </section>
  );
}