import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
  const { userProfile, isGuest } = useAuth();
  const location = useLocation();

  if (!userProfile && !isGuest) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
