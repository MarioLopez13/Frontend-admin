import UserStatusBadge from "./UserStatusBadge";
import type { UserAdminView } from "../types/user-admin.types";

type UserDetailCardProps = {
  user: UserAdminView;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>

        <UserStatusBadge status={user.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            ID de usuario
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{user.id}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rol
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">Usuario</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Fecha de creación
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formatDateTime(user.createdAt)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Última actualización
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formatDateTime(user.updatedAt)}
          </p>
        </div>
      </div>
    </article>
  );
}