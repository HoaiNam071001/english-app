// src/components/Auth/AdminRoute.tsx
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { Navigate, Outlet } from "react-router-dom";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) return <div>Loading checking permissions...</div>;

  // Kiểm tra role (giả sử field role là 'ADMIN')
  if (!userProfile || userProfile.role !== UserRole.ADMIN) {
    // Nếu không phải admin, đá về trang chủ
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Nếu có truyền children thì render children, không thì render Outlet (cho nested route)
  return children ? <>{children}</> : <Outlet />;
};
