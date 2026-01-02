import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/components/Auth/AdminRoute";
import EmailEntry from "@/components/Auth/EmailEntry";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { StatusGuard } from "@/components/Auth/StatusGuard";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import UsersPage from "@/pages/admin/UsersPage";
import { Loader2 } from "lucide-react";
import HomePage from "./home";
import SharedPage from "./shared";
import { AppLayout } from "./UserLayout";

export const MainLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <BrowserRouter>
      <StatusGuard>
        <Routes>
          {/* Public Routes (Ví dụ: Login) */}
          <Route path={ROUTES.LOGIN} element={<EmailEntry />} />

          {/* Protected Routes (Yêu cầu phải là User hoặc Guest) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.SHARED} element={<SharedPage />} />

              <Route path={ROUTES.ADMIN.ROOT} element={<AdminRoute />}>
                <Route path={ROUTES.ADMIN.USERS} element={<UsersPage />} />
              </Route>
            </Route>

            {/* Admin Only - Bọc thêm một lớp AdminRoute */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StatusGuard>
    </BrowserRouter>
  );
};
