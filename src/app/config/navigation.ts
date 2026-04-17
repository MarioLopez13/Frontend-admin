import { routes } from "./routes";
import type { AppPermission } from "@/core/auth/auth.types";

export type NavigationItem = {
  label: string;
  path: string;
  permission: AppPermission;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: routes.dashboard,
    permission: "dashboard:view",
  },
  {
    label: "Usuarios",
    path: routes.users,
    permission: "users:view",
  },
  {
    label: "Pagos",
    path: routes.payments,
    permission: "payments:view",
  },
  {
    label: "QR",
    path: routes.qr,
    permission: "qr:view",
  },
];