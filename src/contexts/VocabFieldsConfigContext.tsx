import { useAuth } from "@/hooks/useAuth";
import { FirebaseVocabFieldsConfigService } from "@/services/vocabFieldsConfig/firebase.adapter";
import { GuestVocabFieldsConfigService } from "@/services/vocabFieldsConfig/guest.adapter";
import { IVocabFieldsConfigService } from "@/services/vocabFieldsConfig/types";
import { DEFAULT_VOCAB_FIELDS_CONFIG, VocabFieldsConfig } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface VocabFieldsConfigContextType {
  config: VocabFieldsConfig;
  loading: boolean;
  setConfig: (config: VocabFieldsConfig) => void;
}

const VocabFieldsConfigContext = createContext<
  VocabFieldsConfigContextType | undefined
>(undefined);

export const VocabFieldsConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;

  const service: IVocabFieldsConfigService = useMemo(
    () =>
      userId
        ? new FirebaseVocabFieldsConfigService(userId)
        : new GuestVocabFieldsConfigService(),
    [userId],
  );

  const [config, setConfigState] = useState<VocabFieldsConfig>(
    DEFAULT_VOCAB_FIELDS_CONFIG,
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
    (next: VocabFieldsConfig) => {
      setConfigState(next);
      service.setConfig(next).catch((err) => {
        console.error("Failed to save vocab fields config:", err);
      });
    },
    [service],
  );

  return (
    <VocabFieldsConfigContext.Provider value={{ config, loading, setConfig }}>
      {children}
    </VocabFieldsConfigContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVocabFieldsConfig = () => {
  const context = useContext(VocabFieldsConfigContext);
  if (!context) {
    throw new Error(
      "useVocabFieldsConfig must be used within a VocabFieldsConfigProvider",
    );
  }
  return context;
};
