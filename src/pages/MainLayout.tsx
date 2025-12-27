import { UserStatus } from "@/types";
import { Loader2 } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/components/Auth/AdminRoute";
import EmailEntry from "@/components/Auth/EmailEntry";
import PendingScreen from "@/components/Auth/PendingScreen";
import { RejectedScreen } from "@/components/Auth/RejectedScreen";
import { UserRoute } from "@/components/Auth/UserRoute";
import { UserFloatingMenu } from "@/components/UserFloatingMenu";
import { GUEST_INFO, ROUTES, STORAGE_KEY } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import UsersPage from "@/pages/admin/UsersPage";
import { AdminLayout } from "./AdminLayout";
import HomePage from "./home";

export const MainLayout = () => {
  const { user, userProfile, loading, isGuest, setIsGuest, logout } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();

  const handleGuestLogin = () => {
    localStorage.setItem(STORAGE_KEY.is_GUEST, "true");
    setIsGuest(true);
  };

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
      localStorage.removeItem(STORAGE_KEY.is_GUEST);

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

  if (!user && !isGuest) {
    return <EmailEntry onGuestLogin={handleGuestLogin} />;
  }

  if (user && userProfile) {
    if (userProfile.status === UserStatus.PENDING) {
      return <PendingScreen email={user.email!} onLogout={logout} />;
    }
    if (userProfile.status === UserStatus.REJECTED) {
      return <RejectedScreen onLogout={logout} />;
    }
  }

  return (
    <BrowserRouter>
      <UserFloatingMenu
        user={user}
        isGuest={isGuest}
        onLogout={logout}
        onGuestExit={logout}
        onGuestClearData={handleGuestClearData}
      />

      <Routes>
        {/* Route Home */}
        <Route path={"/"} element={<UserRoute></UserRoute>}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
        </Route>

        {/* Route Admin */}
        <Route
          path={ROUTES.ADMIN.ROOT}
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.ADMIN.USERS} replace />} />

          <Route path={ROUTES.ADMIN.USERS} element={<UsersPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
