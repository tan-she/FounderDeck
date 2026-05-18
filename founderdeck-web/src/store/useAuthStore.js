import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user, token) => set((state) => ({ 
        user, 
        token: token ?? state.token, 
        isAuthenticated: !!user 
      })),
      setToken: (token) => set({ token, isAuthenticated: !!token }),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        window.location.href = '/login';
      },

      login: async (credentials) => {
        try {
          const { data } = await api.post('/auth/login', credentials);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },

      register: async (userData) => {
        try {
          const { data } = await api.post('/auth/register', userData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
      },

      hydrateFromStorage: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        set({ token, isAuthenticated: true, isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;
