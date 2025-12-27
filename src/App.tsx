// src/App.tsx
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MainLayout } from "./pages/MainLayout";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <ToastProvider>
            <MainLayout />
          </ToastProvider>
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
