import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if (status === 401) {
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/auth')) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
