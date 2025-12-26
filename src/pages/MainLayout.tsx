import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { UserStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// Components
import HomePage from "./home";
import EmailEntry from "@/components/EmailEntry";
import PendingScreen from "@/components/PendingScreen";
import { Button } from "@/components/ui/button";

// Màn hình từ chối (Local component)
const RejectedScreen = ({ onLogout }: { onLogout: () => void }) => (
  <div className="h-screen flex items-center justify-center flex-col gap-4">
    <h2 className="text-xl text-red-600 font-bold">Tài khoản bị từ chối truy cập</h2>
    <Button onClick={onLogout}>Đăng xuất</Button>
  </div>
);

export const MainLayout = () => {
  const { user, userProfile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  // 
  if (!user) {
    return <EmailEntry />; 
  }

  if (!userProfile || userProfile.status === UserStatus.PENDING) {
    return <PendingScreen email={user.email!} onLogout={logout} />;
  }

  if (userProfile.status === UserStatus.REJECTED) {
    return <RejectedScreen onLogout={logout} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};