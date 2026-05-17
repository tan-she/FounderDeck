import { create } from 'zustand';
import api from '../api/axios';
import { API_ORIGIN } from '../config/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read_at: new Date().toISOString() })),
      unreadCount: 0,
    }));
  },

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.count });
    } catch {
      // silent
    }
  },

  startListening: (userId) => {
    if (!userId || typeof window === 'undefined') return;
    import('laravel-echo').then(({ default: Echo }) => {
      import('pusher-js').then((Pusher) => {
        window.Pusher = Pusher.default;
        const echo = new Echo({
          broadcaster: 'reverb',
          key: import.meta.env.VITE_REVERB_KEY,
          wsHost: import.meta.env.VITE_REVERB_HOST,
          wsPort: import.meta.env.VITE_REVERB_PORT,
          wssPort: import.meta.env.VITE_REVERB_PORT,
          forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
          enabledTransports: ['ws', 'wss'],
          authEndpoint: `${API_ORIGIN}/broadcasting/auth`,
          auth: {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        });
        echo.private(`user.${userId}`).listen('MessageSent', (e) => {
          if (e.type?.startsWith('notification')) {
            get().addNotification(e.notification);
          }
        });
      });
    });
  },
}));

export default useNotificationStore;
