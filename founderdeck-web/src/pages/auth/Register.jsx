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
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl border border-white/10 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', 'entrepreneur')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'entrepreneur' 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <Building2 className={`w-6 h-6 mb-2 ${selectedRole === 'entrepreneur' ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${selectedRole === 'entrepreneur' ? 'text-indigo-400' : 'text-gray-300'}`}>
                    Founder
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'investor')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'investor' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${selectedRole === 'investor' ? 'text-purple-400' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${selectedRole === 'investor' ? 'text-purple-400' : 'text-gray-300'}`}>
                    Investor
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  {...register('name')}
                  type="text"
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === 'entrepreneur' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                }`}
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
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={oauthUrl('google')}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Sign up with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
