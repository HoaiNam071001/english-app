import { Loader2 } from "lucide-react";
import { UserRole, UserStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth"; // Import Hook

import EmailEntry from "@/components/EmailEntry";
import PendingScreen from "@/components/PendingScreen";
import { TopicProvider } from "@/contexts/TopicContext";
import AdminUserManagement from "@/components/AdminUserManagement";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "./DashboardContent";

const HomePage = () => {
  // Sử dụng Hook thay vì viết logic loằng ngoằng
  const { user, userProfile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 1. Chưa login
  if (!user || !userProfile) {
    return <EmailEntry />;
  }

  // 2. REJECTED
  if (userProfile.status === UserStatus.REJECTED) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl text-red-600 font-bold">Tài khoản bị từ chối truy cập</h2>
        <Button onClick={logout}>Đăng xuất</Button>
      </div>
    );
  }

  // 3. PENDING
  if (userProfile.status === UserStatus.PENDING) {
    return <PendingScreen email={user.email!} onLogout={logout} />;
  }

  // 4. APPROVED
  return (
    <TopicProvider userId={userProfile.id!}>
      <div className="relative">
        <DashboardContent user={userProfile} onLogout={logout} />

        {userProfile.role === UserRole.ADMIN && (
          <div className="fixed bottom-4 left-4 z-50">
            <AdminUserManagement currentAdminId={userProfile.id!} />
          </div>
        )}
      </div>
    </TopicProvider>
  );
};

export default HomePage;