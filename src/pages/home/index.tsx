import { UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth"; 
import { TopicProvider } from "@/contexts/TopicContext";
import AdminUserManagement from "@/components/Auth/AdminUserManagement";
import { DashboardContent } from "./components/DashboardContent";
// Lưu ý: Import DashboardContent cho đúng đường dẫn (có thể cần chỉnh lại ../components/...)

const HomePage = () => {
  const { userProfile, logout } = useAuth();

  if (!userProfile) return null;

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