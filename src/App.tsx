// src/App.tsx
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { ToastProvider } from "./contexts/ToastContext";
import { MainLayout } from "./pages/MainLayout";

const App = () => {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
};

export default App;
