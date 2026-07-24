import { useEffect, useMemo, useState } from "react";
import { usersService } from "../services/users.service";
import { exportCsv } from "@/shared/utils/exportCsv";
import { useAuthStore } from "@/store/auth/auth.store";
import type {
  CreateUserRequest,
  UserAdminView,
  UserFilters,
} from "../types/user-admin.types";
import UserCreateForm from "../components/UserCreateForm";
import UserFiltersComponent from "../components/UserFilters";
import UsersTable from "../components/UsersTable";

const initialFilters: UserFilters = {
  search: "",
  status: "all",
};
const PAGE_SIZE = 20;

export default function UsersPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async (nextFilters: UserFilters, nextPage = page) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await usersService.getUsers(
        nextFilters,
        nextPage,
        PAGE_SIZE
      );
      setUsers(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo cargar usuarios.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(filters, page);
  }, [filters, page]);

  const counters = useMemo(() => {
    const active = users.filter(
      (user) => user.status === "active"
    ).length;

    const inactive = users.filter(
      (user) => user.status === "inactive"
    ).length;

    return {
      total: totalCount,
      active,
      inactive,
    };
  }, [totalCount, users]);

  const handleToggleStatus = async (user: UserAdminView) => {
    const nextStatus =
      user.status === "active" ? "inactive" : "active";

    try {
      setError("");
      setFeedback("");
      setIsLoading(true);

      // Solicita el cambio al backend.
      await usersService.updateUserStatus(user.id, {
        status: nextStatus,
      });

      // Vuelve a consultar los datos reales del backend.
      const refreshedPage = await usersService.getUsers(
        filters,
        page,
        PAGE_SIZE
      );

      setUsers(refreshedPage.items);
      setTotalCount(refreshedPage.totalCount);
      setTotalPages(refreshedPage.totalPages);

      const refreshedUser = refreshedPage.items.find(
        (currentUser) => currentUser.id === user.id
      );

      if (!refreshedUser) {
        setError(
          "No fue posible verificar el estado actualizado del usuario."
        );
        return;
      }

      // El backend respondió correctamente, pero no permitió cambiarlo.
      if (refreshedUser.status !== nextStatus) {
        const attemptedAction =
          nextStatus === "inactive" ? "desactivar" : "activar";

        setError(
          `No es posible ${attemptedAction} a ${user.fullName}. ` +
            "Este usuario está protegido por el sistema."
        );

        return;
      }

      setFeedback(
        `Estado actualizado: ${refreshedUser.fullName} ahora está ${
          refreshedUser.status === "active"
            ? "activo"
            : "inactivo"
        }.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del usuario.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (
    nextFilters: UserFilters
  ) => {
    setFeedback("");
    setError("");
    setPage(0);
    setFilters(nextFilters);
  };

  const handleCreate = async (payload: CreateUserRequest) => {
    try {
      setIsSubmitting(true);
      setError("");
      const created = await usersService.createUser(payload);
      setFeedback(`Usuario ${created.fullName} creado correctamente.`);
      setIsCreating(false);
      setPage(0);
      await loadUsers(filters, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: UserAdminView) => {
    const confirmed = window.confirm(
      `¿Confirma que desea eliminar a ${user.fullName}?`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      setError("");
      setFeedback("");
      await usersService.deleteUser(user.id);
      const nextPage = users.length === 1 && page > 0 ? page - 1 : page;
      setFeedback(`Usuario ${user.fullName} eliminado correctamente.`);
      setPage(nextPage);
      await loadUsers(filters, nextPage);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el usuario."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportUsers = () => {
    exportCsv(
      "smartpayut_usuarios",
      users.map((user) => ({
        Nombre: user.fullName,
        Correo: user.email,
        Estado:
          user.status === "active"
            ? "Activo"
            : "Inactivo",
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
            Consulta, filtra, edita y activa/desactiva
            usuarios finales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {role === "admin" && (
            <button
              onClick={() => setIsCreating((current) => !current)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Nuevo usuario
            </button>
          )}

          <button
            onClick={handleExportUsers}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            Exportar CSV
          </button>

          <button
            onClick={() => void loadUsers(filters, page)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Recargar
          </button>
        </div>
      </div>

      {isCreating && (
        <UserCreateForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isSubmitting={isSubmitting}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total usuarios
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {counters.total}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Activos
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {counters.active}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Inactivos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-600">
            {counters.inactive}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <UserFiltersComponent
          value={filters}
          onChange={handleFiltersChange}
        />
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
        <UsersTable
          users={users}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
