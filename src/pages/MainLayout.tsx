import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/components/Auth/AdminRoute";
import EmailEntry from "@/components/Auth/EmailEntry";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { StatusGuard } from "@/components/Auth/StatusGuard";
import { UserFloatingMenu } from "@/components/UserFloatingMenu";
import { GUEST_INFO, ROUTES, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import UsersPage from "@/pages/admin/UsersPage";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import HomePage from "./home";

export const MainLayout = () => {
  const { user, isGuest, loading, setIsGuest, logout, switchAccount } =
    useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const handleGuestClearData = async () => {
    const isConfirmed = await confirm({
      title: "Clear Data?",
      message:
        "Are you sure you want to delete all data (vocabulary, topics) saved on this device? This action cannot be undone.",
      confirmText: "Clear Now",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (isConfirmed) {
      localStorage.removeItem(STORAGE_KEY.IS_GUEST);

      Object.values(GUEST_INFO.storageKey).forEach((key) => {
        localStorage.removeItem(key);
      });

      setIsGuest(false);
      toast.success("Data cleared successfully!");
    }
  };
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
        <UserFloatingMenu
          user={user}
          isGuest={isGuest}
          onLogout={logout}
          onGuestExit={logout}
          onGuestClearData={handleGuestClearData}
          onSwitchAccount={switchAccount}
        />
        <Routes>
          {/* Public Routes (Ví dụ: Login) */}
          <Route path={ROUTES.LOGIN} element={<EmailEntry />} />

          {/* Protected Routes (Yêu cầu phải là User hoặc Guest) */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />

            {/* Admin Only - Bọc thêm một lớp AdminRoute */}
            <Route
              path={ROUTES.ADMIN.ROOT}
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path={ROUTES.ADMIN.USERS} element={<UsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StatusGuard>
    </BrowserRouter>
  );
};
