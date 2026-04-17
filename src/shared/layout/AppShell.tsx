import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppShell() {
  return (
    <div className="flex h-screen bg-slate-100">
      <AppSidebar />

      <div className="flex flex-1 flex-col p-6">
        <AppHeader />

        <main className="mt-6 flex-1 overflow-auto rounded-xl bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}