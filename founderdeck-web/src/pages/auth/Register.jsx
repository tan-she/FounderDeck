import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { oauthUrl } from '../../config/api';
import { Loader2, AlertCircle, Building2, Briefcase } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['entrepreneur', 'investor']),
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'entrepreneur',
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setError('');
    const result = await registerUser({
      ...data,
      password_confirmation: data.password // Laravel requires this by default
    });
    
    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEAEA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#FF5C00]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-display font-black text-[#111111] tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#FF5C00] hover:text-[#E65300] transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl border border-black/5 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', 'entrepreneur')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'entrepreneur' 
                    ? 'border-[#FF5C00] bg-[#FF5C00]/10' 
                    : 'border-black/5 bg-[#F4F4F4] hover:border-black/10'
                  }`}
                >
                  <Building2 className={`w-6 h-6 mb-2 ${selectedRole === 'entrepreneur' ? 'text-[#FF5C00]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'entrepreneur' ? 'text-[#FF5C00]' : 'text-gray-600'}`}>
                    Founder
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'investor')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'investor' 
                    ? 'border-[#FF5C00] bg-[#FF5C00]/10' 
                    : 'border-black/5 bg-[#F4F4F4] hover:border-black/10'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${selectedRole === 'investor' ? 'text-[#FF5C00]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'investor' ? 'text-[#FF5C00]' : 'text-gray-600'}`}>
                    Investor
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  {...register('name')}
                  type="text"
                  className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-2 text-sm font-semibold text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-2 text-sm font-semibold text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  className="appearance-none block w-full px-3 py-2.5 border border-black/5 bg-[#F4F4F4] rounded-xl placeholder-gray-400 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5C00] focus:border-[#FF5C00] transition-shadow sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-2 text-sm font-semibold text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md shadow-[#FF5C00]/15 text-sm font-bold text-white bg-[#FF5C00] hover:bg-[#E65300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5C00] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('oauth_intended_role', selectedRole);
                  window.location.href = oauthUrl('google');
                }}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-black/10 rounded-full bg-[#F4F4F4] text-sm font-bold text-gray-700 hover:bg-black/5 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
