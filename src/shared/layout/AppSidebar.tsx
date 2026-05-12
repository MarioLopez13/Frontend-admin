import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "@/app/config/navigation";
import { hasPermission } from "@/core/auth/permissions";
import { useAuthStore } from "@/store/auth/auth.store";

function isItemActive(currentPath: string, itemPath: string) {
  if (itemPath === "/") {
    return currentPath === "/";
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export default function AppSidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const visibleItems = navigationItems.filter((item) =>
    hasPermission(user?.role, item.permission)
  );

  return (
    <aside className="flex h-full w-72 flex-col bg-slate-950 p-4 text-white">
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <img
          src="/kynsoft-logo.png"
          alt="KynSoft"
          className="h-16 w-auto object-contain"
        />
        <div className="mt-4 border-t border-white/10 pt-4">
          <h1 className="text-lg font-bold">SmartPayUT Admin</h1>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            Gestión de pagos QR/NFC y transacciones de transporte.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {visibleItems.map((item) => {
          const active = isItemActive(location.pathname, item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-2 text-xs text-slate-500">
        KynSoft · SmartPayUT
      </div>
    </aside>
  );
}
