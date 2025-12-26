import { Button } from "@/components/ui/button";
import { ABSOLUTE_ROUTES } from "@/constants";
import {} from "@/contexts/AuthContext";
import { TopicProvider } from "@/contexts/TopicContext";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "./components/DashboardContent";

const HomePage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <TopicProvider userId={userProfile?.id}>
      <div className="relative">
        <DashboardContent user={userProfile} />

        {/* Nút Admin chuyển trang */}
        {userProfile?.role === UserRole.ADMIN && (
          <div className="fixed bottom-4 left-4 z-50">
            <Button
              variant="outline"
              className="gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-lg"
              onClick={() => navigate(ABSOLUTE_ROUTES.ADMIN_USERS)}
            >
              <ShieldAlert size={16} />
              Quản lý User
            </Button>
          </div>
        )}
      </div>
    </TopicProvider>
  );
};

export default HomePage;
