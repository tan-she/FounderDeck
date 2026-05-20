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
    const user  = searchParams.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        // Save the Sanctum token
        localStorage.setItem('token', token);

        // Hydrate auth store and redirect based on role
        const initializeAuth = async () => {
          await hydrateFromStorage();

          const store = useAuthStore.getState();
          const role = store.user?.role || parsedUser.role;

          if (role === 'investor') {
            navigate('/dashboard/investor', { replace: true });
          } else if (role === 'super_admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard/entrepreneur', { replace: true });
          }
        };

        initializeAuth();
      } catch (e) {
        navigate('/login?error=invalid_callback', { replace: true });
      }
    } else if (token) {
      // Fallback: only token, no user object
      localStorage.setItem('token', token);

      const initializeAuth = async () => {
        await hydrateFromStorage();

        const store = useAuthStore.getState();
        const role = store.user?.role;

        if (role === 'investor') {
          navigate('/dashboard/investor', { replace: true });
        } else if (role === 'super_admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard/entrepreneur', { replace: true });
        }
      };

      initializeAuth();
    } else {
      // No token — something went wrong
      navigate('/login?error=google_failed', { replace: true });
    }
  }, [searchParams, navigate, hydrateFromStorage]);

  return (
    <div className="min-h-screen bg-[#EAEAEA] flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-[#FF5C00] animate-spin mb-4" />
      <h2 className="text-xl font-display font-black text-[#111111]">Signing you in with Google...</h2>
      <p className="text-gray-500 font-semibold mt-2">Please wait while we log you in.</p>
    </div>
  );
}
