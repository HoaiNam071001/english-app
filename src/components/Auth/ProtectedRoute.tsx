import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserStatus } from "@/types";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { user, userProfile, loading } = useAuth();

  // 1. Màn hình Loading chung
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 2. Chưa Login -> Redirect về trang Login
  if (!user || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // 3. User bị Reject -> Redirect về trang Rejected
  if (userProfile.status === UserStatus.REJECTED) {
    return <Navigate to="/rejected" replace />;
  }

  // 4. User đang Pending -> Redirect về trang Pending
  if (userProfile.status === UserStatus.PENDING) {
    return <Navigate to="/pending" replace />;
  }

  // 5. Approved -> Cho phép hiển thị nội dung bên trong (Outlet)
  return <Outlet context={{ userProfile }} />;
};

export default ProtectedRoute;