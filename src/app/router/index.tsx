import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { routes } from "@/app/config/routes";
import AuthGuard from "@/core/auth/auth.guard";
import AppShell from "@/shared/layout/AppShell";

import LoginPage from "@/features/auth/pages/LoginPage";
import UnauthorizedPage from "@/features/auth/pages/UnauthorizedPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import PaymentsPage from "@/features/payments/pages/PaymentsPage";
import TransactionsPage from "@/features/transactions/pages/TransactionsPage";
import QrPage from "@/features/qr/pages/QrPage";
import UsersPage from "@/features/users/pages/UsersPage";
import UserDetailPage from "@/features/users/pages/UserDetailPage";
import UserEditPage from "@/features/users/pages/UserEditPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.unauthorized} element={<UnauthorizedPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />

            <Route element={<AuthGuard permission="users:view" />}>
              <Route path={routes.users} element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
            </Route>

            <Route element={<AuthGuard permission="users:edit" />}>
              <Route path="/users/:id/edit" element={<UserEditPage />} />
            </Route>

            <Route element={<AuthGuard permission="payments:view" />}>
              <Route path={routes.payments} element={<PaymentsPage />} />
            </Route>

            <Route element={<AuthGuard permission="transactions:view" />}>
              <Route path={routes.transactions} element={<TransactionsPage />} />
            </Route>

            <Route element={<AuthGuard permission="qr:view" />}>
              <Route path={routes.qr} element={<QrPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}