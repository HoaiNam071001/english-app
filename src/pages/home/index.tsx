import {} from "@/contexts/AuthContext";
import { TopicProvider } from "@/contexts/TopicContext";
import { useAuth } from "@/hooks/useAuth";
import { DashboardContent } from "./components/DashboardContent";

const HomePage = () => {
  const { userProfile } = useAuth();
  return (
    <TopicProvider userId={userProfile?.id}>
      <div className="relative">
        <DashboardContent user={userProfile} />
      </div>
    </TopicProvider>
  );
};

export default HomePage;
