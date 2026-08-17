import { ConfirmProvider } from "./contexts/ConfirmContext";
import { ShortcutsProvider } from "./contexts/ShortcutsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { MainLayout } from "./pages/MainLayout";
// Redux imports
import { AuthInitializer } from "@/components/AuthInitializer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { store } from "@/store/store";
import { Provider } from "react-redux";

const App = () => {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <ThemeProvider>
        <ConfirmProvider>
          <ToastProvider>
            <ShortcutsProvider>
              <MainLayout />
              <PWAInstallPrompt />
            </ShortcutsProvider>
          </ToastProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
