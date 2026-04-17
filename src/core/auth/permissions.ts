import type { AppPermission, AppRole } from "./auth.types";

export const rolePermissions: Record<AppRole, AppPermission[]> = {
  admin: [
    "dashboard:view",
    "users:view",
    "users:edit",
    "users:status",
    "payments:view",
    "qr:view",
  ],
  operator: [
    "dashboard:view",
    "users:view",
    "users:edit",
    "users:status",
    "payments:view",
    "qr:view",
  ],
  user: [],
};

export function hasPermission(
  role: AppRole | undefined,
  permission: AppPermission
) {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}