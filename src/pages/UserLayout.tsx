// components/Layout/AppLayout.tsx
import { MainHeader } from "@/components/MainHeader";
import { Outlet } from "react-router-dom";

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden flex-col bg-background">
      <MainHeader />
      <main className="flex-1 overflow-auto max-w-10xl mx-auto container pt-4">
        <Outlet />
      </main>
    </div>
  );
};
