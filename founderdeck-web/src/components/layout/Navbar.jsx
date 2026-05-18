import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, Menu, UserCircle, LogOut, LayoutDashboard, X, UserPen } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuthStore();
  
  const user = auth?.user ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  
  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'super_admin') return '/admin/dashboard';
    if (user.role === 'entrepreneur') return '/dashboard/entrepreneur';
    return '/dashboard/investor';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EAEAEA]/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-display font-black tracking-tight text-gray-950 flex items-center gap-1.5 hover:text-[#FF5C00] transition-colors">
              <span className="w-2.5 h-2.5 bg-[#FF5C00] rounded-sm transform rotate-45" />
              FounderDeck
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/pitches" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Pitches</Link>
            <Link to="/#how-it-works" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">How it works</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="text-gray-600 hover:text-black hover:scale-105 transition-all">
                  <Bell className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-black font-semibold text-sm">
                    <UserAvatar src={user?.avatar_url} name={user?.name} size="sm" />
                    <span>{user?.name || 'Account'}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-black/5 rounded-xl shadow-xl shadow-black/[0.05] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to={getDashboardLink()} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-gray-500" /> Dashboard
                    </Link>
                    <Link to="/profile/edit" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium">
                      <UserPen className="w-4 h-4 mr-2 text-gray-500 group-hover:text-orange-600" /> Edit Profile
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-semibold">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Login</Link>
                <Link to="/register" className="bg-[#FF5C00] hover:bg-[#E65300] text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-[#FF5C00]/15 transition-all text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="text-gray-600 hover:text-black"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-black/5 bg-[#EAEAEA] px-4 py-4 shadow-inner">
          <div className="flex flex-col gap-3">
            <Link onClick={() => setIsOpen(false)} to="/pitches" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Pitches</Link>
            {isAuthenticated ? (
              <>
                <Link onClick={() => setIsOpen(false)} to={getDashboardLink()} className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Dashboard</Link>
                <Link onClick={() => setIsOpen(false)} to="/profile/edit" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Edit Profile</Link>
                <Link onClick={() => setIsOpen(false)} to="/notifications" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Notifications</Link>
                <button onClick={handleLogout} className="text-left text-sm font-semibold text-red-500 hover:text-red-600 transition">Sign Out</button>
              </>
            ) : (
              <>
                <Link onClick={() => setIsOpen(false)} to="/login" className="text-sm font-semibold text-gray-700 hover:text-[#FF5C00] transition">Login</Link>
                <Link onClick={() => setIsOpen(false)} to="/register" className="rounded-full bg-[#FF5C00] px-4 py-2.5 text-center font-bold text-white hover:bg-[#E65300] transition shadow-md shadow-[#FF5C00]/15 text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
