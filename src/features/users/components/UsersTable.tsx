import { Link } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { hasPermission } from "@/core/auth/permissions";
import { useAuthStore } from "@/store/auth/auth.store";
import type { UserAdminView } from "../types/user-admin.types";
import UserStatusBadge from "./UserStatusBadge";

type UsersTableProps = {
  users: UserAdminView[];
  onToggleStatus: (user: UserAdminView) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

export default function UsersTable({
  users,
  onToggleStatus,
}: UsersTableProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canEdit = hasPermission(role, "users:edit");
  const canToggleStatus = hasPermission(role, "users:status");

  if (!users.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        No se encontraron usuarios con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.fullName}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={routes.userDetail(user.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Ver detalle
                    </Link>

                    {canEdit && (
                      <Link
                        to={routes.userEdit(user.id)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Editar
                      </Link>
                    )}

                    {canToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(user)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {user.status === "active" ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}