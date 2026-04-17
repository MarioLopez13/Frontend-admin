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
    <aside className="flex h-full w-64 flex-col bg-slate-900 p-4 text-white">
      <div className="mb-8">
        <h1 className="text-xl font-bold">SmartPayout Admin</h1>
        <p className="text-sm text-slate-400">
          Administración de pagos QR y NFC
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {visibleItems.map((item) => {
          const active = isItemActive(location.pathname, item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}