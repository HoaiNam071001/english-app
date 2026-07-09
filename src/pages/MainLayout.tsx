import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";

import { AdminRoute } from "@/components/Auth/AdminRoute";
import EmailEntry from "@/components/Auth/EmailEntry";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { StatusGuard } from "@/components/Auth/StatusGuard";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./AppLayout";

import HomePage from "./home";
const NotePage = lazy(() => import("./note"));
const SharedPage = lazy(() => import("./shared"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));

const PageLoader = () => (
  <div className="h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

export const MainLayout = () => {
  const { loading } = useAuth();
  const { isFirebaseReady } = useAppSelector((state) => state.auth);

  const [isDelaying, setIsDelaying] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady) return;

    const timer = setTimeout(() => {
      setIsDelaying(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isFirebaseReady]);

  if (loading || isDelaying) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <StatusGuard>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<EmailEntry />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.SHARED} element={<SharedPage />} />
                <Route path={ROUTES.NOTE} element={<NotePage />} />

                <Route path={ROUTES.ADMIN.ROOT} element={<AdminRoute />}>
                  <Route
                    path={ROUTES.ADMIN.USERS}
                    element={<UsersPage />}
                  />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </StatusGuard>
    </BrowserRouter>
  );
};