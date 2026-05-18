import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

import api from '../../api/axios';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Read the role the user picked on the Register page
      const intendedRole = localStorage.getItem("oauth_intended_role") || "investor";
      localStorage.removeItem("oauth_intended_role"); // clean up

      // Send token + role to backend to finalize account
      api.post('/auth/google/finalize', { token, role: intendedRole })
        .then(({ data }) => {
          // Store the real Sanctum token
          localStorage.setItem('token', data.token);
          
          // Update store and hydrate user data
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
        })
        .catch(() => navigate('/login?error=auth_failed'));
    } else {
      // No token found, redirect to login with error
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate, hydrateFromStorage]);

  return (
    <div className="min-h-screen bg-[#EAEAEA] flex flex-col items-center justify-center p-4">
      <Loader2 className="w-12 h-12 text-[#FF5C00] animate-spin mb-4" />
      <h2 className="text-xl font-display font-black text-[#111111]">Authenticating with Google...</h2>
      <p className="text-gray-500 font-semibold mt-2">Please wait while we log you in.</p>
    </div>
  );
}
