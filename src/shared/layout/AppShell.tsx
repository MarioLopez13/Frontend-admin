import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppShell() {
  return (
    <div className="flex h-screen bg-slate-100">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col p-6">
        <AppHeader />

        <main className="mt-6 min-h-0 flex-1 overflow-auto rounded-2xl bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
