import { useEffect, useMemo, useState } from "react";
import { usersService } from "../services/users.service";
import { exportCsv } from "@/shared/utils/exportCsv";
import type { UserAdminView, UserFilters } from "../types/user-admin.types";
import UserFiltersComponent from "../components/UserFilters";
import UsersTable from "../components/UsersTable";

const initialFilters: UserFilters = {
  search: "",
  status: "all",
};

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadUsers = async (nextFilters: UserFilters) => {
    try {
      setIsLoading(true);
      setError("");
      const result = await usersService.getUsers(nextFilters);
      setUsers(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar usuarios.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(filters);
  }, [filters]);

  const counters = useMemo(() => {
    const active = users.filter((user) => user.status === "active").length;
    const inactive = users.filter((user) => user.status === "inactive").length;

    return {
      total: users.length,
      active,
      inactive,
    };
  }, [users]);

  const handleToggleStatus = async (user: UserAdminView) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";

    try {
      setError("");
      setFeedback("");

      const updatedUser = await usersService.updateUserStatus(user.id, {
        status: nextStatus,
      });

      await loadUsers(filters);

      setFeedback(
        `Estado actualizado: ${updatedUser.fullName} ahora está ${
          updatedUser.status === "active" ? "activo" : "inactivo"
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

  const handleFiltersChange = (nextFilters: UserFilters) => {
    setFeedback("");
    setFilters(nextFilters);
  };

  const handleExportUsers = () => {
    exportCsv(
      "smartpayut_usuarios",
      users.map((user) => ({
        Nombre: user.fullName,
        Correo: user.email,
        Estado: user.status === "active" ? "Activo" : "Inactivo",
        Rol: user.role,
        "Fecha de creación": user.createdAt,
      })),
      "No existen usuarios para exportar."
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de usuarios
          </h1>
          <p className="text-sm text-slate-500">
            Consulta, filtra, edita y activa/desactiva usuarios finales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportUsers}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            Exportar CSV
          </button>

          <button
            onClick={() => void loadUsers(filters)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Recargar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total usuarios</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {counters.total}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Activos</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {counters.active}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Inactivos</p>
          <p className="mt-2 text-3xl font-bold text-slate-600">
            {counters.inactive}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <UserFiltersComponent value={filters} onChange={handleFiltersChange} />
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

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          Cargando usuarios...
        </div>
      ) : (
        <UsersTable users={users} onToggleStatus={handleToggleStatus} />
      )}
    </section>
  );
}