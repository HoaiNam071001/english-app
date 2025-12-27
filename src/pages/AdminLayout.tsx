// src/layouts/AdminLayout.tsx
import { Link, Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* --- ADMIN SIDEBAR (THEME) --- */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border">
        <h2 className="text-xl font-bold mb-6 text-sidebar-foreground">
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admin/users"
            className="p-2 hover:bg-sidebar-accent rounded transition-colors text-sidebar-foreground"
          >
            Manage Users
          </Link>
          <Link
            to="/"
            className="p-2 hover:bg-sidebar-accent rounded transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            Back to Home
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};
