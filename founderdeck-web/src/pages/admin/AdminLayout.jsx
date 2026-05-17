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
    <div className="min-h-screen bg-[#EAEAEA] pt-16 text-[#111111] md:flex">
      <aside className="z-20 flex h-auto w-full flex-col border-b border-black/5 bg-[#F4F4F4] md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-black/5 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF5C00]">Admin</p>
          <h1 className="mt-1 text-xl font-display font-black text-[#111111] uppercase tracking-tight">FounderDeck Ops</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${isActive ? 'bg-[#FF5C00]/10 text-[#FF5C00]' : 'text-gray-500 hover:bg-black/5 hover:text-[#111111]'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-black/5 p-4">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-500/10">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-[#EAEAEA] p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
