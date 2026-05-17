import api from './axios';
import { oauthUrl } from '../config/api';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const googleRedirect = () => {
  window.location.href = oauthUrl('google');
};
