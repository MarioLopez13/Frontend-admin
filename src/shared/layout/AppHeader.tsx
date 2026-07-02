import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ClipboardCheck,
  CreditCard,
  QrCode,
  ReceiptText,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/app/config/routes";
import { useAuthStore } from "@/store/auth/auth.store";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: "alert" | "task" | "users" | "payments" | "transactions" | "qr";
  tag: string;
};

const notifications: NotificationItem[] = [
  {
    id: "reported-qr-issue",
    title: "Problema reportado en lectura QR",
    description:
      "Un operador reportó una incidencia durante la validación de un código QR.",
    route: "/qr",
    icon: "alert",
    tag: "Incidencia",
  },
  {
    id: "user-review-task",
    title: "Revisión de usuario asignada",
    description:
      "Se asignó una tarea de revisión de estado para un usuario registrado.",
    route: "/users",
    icon: "task",
    tag: "Tarea",
  },
  {
    id: "payment-monitoring",
    title: "Pagos pendientes de revisión",
    description:
      "Existen operaciones de pago que requieren seguimiento administrativo.",
    route: "/payments",
    icon: "payments",
    tag: "Pagos",
  },
  {
    id: "transactions-report",
    title: "Transacciones disponibles",
    description:
      "Consulta el historial operativo actualizado de transacciones del sistema.",
    route: "/transactions",
    icon: "transactions",
    tag: "Reporte",
  },
];

function NotificationIcon({ icon }: { icon: NotificationItem["icon"] }) {
  const className = "h-4 w-4";

  if (icon === "alert") return <AlertTriangle className={className} />;
  if (icon === "task") return <ClipboardCheck className={className} />;
  if (icon === "users") return <Users className={className} />;
  if (icon === "payments") return <CreditCard className={className} />;
  if (icon === "transactions") return <ReceiptText className={className} />;

  return <QrCode className={className} />;
}

export default function AppHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate(routes.login, { replace: true });
  };

  const handleToggleNotifications = () => {
    setShowNotifications((value) => !value);
    setHasUnreadNotifications(false);
  };

  const handleNotificationClick = (route: string) => {
    setShowNotifications(false);
    navigate(route);
  };

  return (
    <header className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
          KynSoft · SmartPayUT
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Panel administrativo
        </h2>
        <p className="text-sm text-slate-500">
          Gestión operativa del sistema de pagos QR y NFC.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell size={20} />

            {hasUnreadNotifications && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-3 w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notificaciones
                  </h3>
                  <p className="text-xs text-slate-500">
                    Alertas administrativas y tareas de revisión.
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {notifications.length} recientes
                </span>
              </div>

              <div className="space-y-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification.route)}
                    className="flex w-full items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-700 shadow-sm">
                      <NotificationIcon icon={notification.icon} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-slate-900">
                          {notification.title}
                        </span>

                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          {notification.tag}
                        </span>
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {notification.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Prototipo visual de notificaciones administrativas navegables.
              </p>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {user?.fullName ?? "Admin SmartPayUT"}
          </p>
          <p className="text-xs uppercase text-slate-500">
            {user?.role ?? "ADMIN"}
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