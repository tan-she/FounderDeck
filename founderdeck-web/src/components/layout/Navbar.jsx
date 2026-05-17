import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, Menu, UserCircle, LogOut, LayoutDashboard, X } from 'lucide-react';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              FounderDeck
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/pitches" className="text-gray-300 hover:text-white transition">Pitches</Link>
            <Link to="/#how-it-works" className="text-gray-300 hover:text-white transition">How it works</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="text-gray-400 hover:text-white">
                  <Bell className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <UserCircle className="w-6 h-6" />
                    <span>{user?.name || 'Account'}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-gray-900 border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to={getDashboardLink()} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="text-gray-400 hover:text-white"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-950/95 px-4 py-4">
          <div className="flex flex-col gap-3">
            <Link onClick={() => setIsOpen(false)} to="/pitches" className="text-gray-300 hover:text-white transition">Pitches</Link>
            {isAuthenticated ? (
              <>
                <Link onClick={() => setIsOpen(false)} to={getDashboardLink()} className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link onClick={() => setIsOpen(false)} to="/notifications" className="text-gray-300 hover:text-white transition">Notifications</Link>
                <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 transition">Sign Out</button>
              </>
            ) : (
              <>
                <Link onClick={() => setIsOpen(false)} to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link onClick={() => setIsOpen(false)} to="/register" className="rounded-md bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-700 transition">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
