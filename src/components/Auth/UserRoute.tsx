// src/components/Auth/AdminRoute.tsx
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";

interface UserRouteProps {
  children?: React.ReactNode;
}

export const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const { userProfile, loading, isGuest } = useAuth();

  if (loading || !(userProfile || isGuest))
    return <div>Loading checking permissions...</div>;

  return children ? <>{children}</> : <Outlet />;
};
