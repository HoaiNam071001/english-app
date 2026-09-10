import { useAuth } from "@/hooks/useAuth";
import { FirebaseReviewConfigService } from "@/services/reviewConfig/firebase.adapter";
import { GuestReviewConfigService } from "@/services/reviewConfig/guest.adapter";
import { IReviewConfigService } from "@/services/reviewConfig/types";
import { DEFAULT_REVIEW_CONFIG, ReviewConfig } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ReviewConfigContextType {
  config: ReviewConfig;
  loading: boolean;
  setConfig: (config: ReviewConfig) => void;
}

const ReviewConfigContext = createContext<ReviewConfigContextType | undefined>(
  undefined,
);

// Lấy config 1 lần khi vào web (theo user) rồi cache lại trong context suốt phiên,
// mọi thay đổi (đổi filter, đổi số giây đếm ngược) đều ghi lại DB/localStorage ngay.
export const ReviewConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;

  const service: IReviewConfigService = useMemo(
    () =>
      userId
        ? new FirebaseReviewConfigService(userId)
        : new GuestReviewConfigService(),
    [userId],
  );

  const [config, setConfigState] = useState<ReviewConfig>(
    DEFAULT_REVIEW_CONFIG,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service.getConfig().then((data) => {
      if (!cancelled) {
        setConfigState(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const setConfig = useCallback(
    (next: ReviewConfig) => {
      setConfigState(next);
      service.setConfig(next).catch((err) => {
        console.error("Failed to save review config:", err);
      });
    },
    [service],
  );

  return (
    <ReviewConfigContext.Provider value={{ config, loading, setConfig }}>
      {children}
    </ReviewConfigContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReviewConfig = () => {
  const context = useContext(ReviewConfigContext);
  if (!context) {
    throw new Error("useReviewConfig must be used within a ReviewConfigProvider");
  }
  return context;
};
