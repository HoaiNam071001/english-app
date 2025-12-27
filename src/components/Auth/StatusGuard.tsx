import { useAuth } from "@/hooks/useAuth";
import { UserStatus } from "@/types";
import PendingScreen from "./PendingScreen";
import { RejectedScreen } from "./RejectedScreen";

export const StatusGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, logout } = useAuth();

  if (userProfile) {
    if (userProfile.status === UserStatus.PENDING) {
      return <PendingScreen email={user.email!} onLogout={logout} />;
    }
    if (userProfile.status === UserStatus.REJECTED) {
      return <RejectedScreen email={user.email!} onLogout={logout} />;
    }
  }

  return <>{children}</>;
};
