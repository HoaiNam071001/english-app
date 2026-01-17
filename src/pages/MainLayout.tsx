import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/components/Auth/AdminRoute";
import EmailEntry from "@/components/Auth/EmailEntry";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { StatusGuard } from "@/components/Auth/StatusGuard";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import UsersPage from "@/pages/admin/UsersPage";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLayout } from "./AppLayout";
import HomePage from "./home";
import NotePage from "./note";
import SharedPage from "./shared";

export const MainLayout = () => {
  const { loading } = useAuth();
  const { isFirebaseReady } = useAppSelector((state) => state.auth);

  const [isDelaying, setIsDelaying] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady) return;
    const timer = setTimeout(() => {
      setIsDelaying(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isFirebaseReady]);

  if (loading || isDelaying) {
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

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.SHARED} element={<SharedPage />} />
              <Route path={ROUTES.NOTE} element={<NotePage />} />

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
