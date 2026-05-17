import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token
      localStorage.setItem('token', token);
      
      // Update store and hydrate user data
      const initializeAuth = async () => {
        await hydrateFromStorage();
        
        // After hydration, the user object will be in the store
        // We can redirect them to the dashboard based on their role
        const store = useAuthStore.getState();
        const role = store.user?.role;
        
        if (role === 'investor') {
          navigate('/dashboard/investor', { replace: true });
        } else if (role === 'super_admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          // Default to entrepreneur for new Google signups
          navigate('/dashboard/entrepreneur', { replace: true });
        }
      };

      initializeAuth();
    } else {
      // No token found, redirect to login with error
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate, hydrateFromStorage]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <h2 className="text-xl font-medium text-white">Authenticating with Google...</h2>
      <p className="text-gray-400 mt-2">Please wait while we log you in.</p>
    </div>
  );
}
