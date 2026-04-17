import type { UserStatus } from "../types/user-admin.types";

type UserStatusBadgeProps = {
  status: UserStatus;
};

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {
  const styles =
    status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  const label = status === "active" ? "Activo" : "Inactivo";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  );
}