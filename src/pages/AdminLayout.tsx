// src/layouts/AdminLayout.tsx
import { Link, Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- ADMIN SIDEBAR (THEME) --- */}
      <aside className="w-64 bg-slate-700 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/users" className="p-2 hover:bg-slate-800 rounded">
            Quản lý Users
          </Link>
          <Link to="/" className="p-2 hover:bg-slate-800 rounded text-gray-400">
            Về trang chủ
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
