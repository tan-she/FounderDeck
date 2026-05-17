import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { BarChart3, FileWarning, LayoutDashboard, LogOut, Users } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Users', path: '/admin/dashboard/users', icon: Users, end: false },
    { name: 'Posts', path: '/admin/dashboard/posts', icon: BarChart3, end: false },
    { name: 'Reports', path: '/admin/dashboard/reports', icon: FileWarning, end: false },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-16 text-white md:flex">
      <aside className="z-20 flex h-auto w-full flex-col border-b border-gray-800 bg-gray-900 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-gray-800 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Admin</p>
          <h1 className="mt-2 text-xl font-bold">FounderDeck Ops</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-800 p-4">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-gray-950 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
