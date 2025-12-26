// src/App.tsx
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider
import { MainLayout } from "./pages/MainLayout";

const App = () => {
  return (
    // Bao bọc toàn bộ App bằng AuthProvider
    <AuthProvider>
       {/* MainLayout của bạn giữ nguyên logic điều hướng bên trong */}
       <MainLayout />
    </AuthProvider>
  );
};

export default App;