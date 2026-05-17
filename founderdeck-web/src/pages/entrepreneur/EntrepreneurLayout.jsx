import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Presentation, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { initials } from '../../lib/format';

export default function EntrepreneurLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard/entrepreneur', icon: LayoutDashboard, end: true },
    { name: 'My Pitches', path: '/dashboard/entrepreneur/pitches', icon: Presentation, end: false },
    { name: 'Collab Inbox', path: '/dashboard/entrepreneur/collabs', icon: MessageSquare, end: false },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row text-white pt-16">
      
      {/* Sidebar */}
      <aside className="z-20 flex h-auto w-full flex-col border-b border-gray-800 bg-gray-900 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-64 md:border-b-0 md:border-r">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full bg-gray-800" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                {initials(user?.name)}
              </div>
            )}
            <div>
              <p className="font-medium text-sm truncate w-32">{user?.name}</p>
              <p className="text-xs text-indigo-400 font-medium">Founder</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-gray-950 p-6 md:p-8 ml-0 md:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
