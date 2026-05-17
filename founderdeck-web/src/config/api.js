const rawApiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const API_ORIGIN = rawApiUrl.replace(/\/+$/, '');
export const API_BASE_URL = API_ORIGIN.endsWith('/api') ? API_ORIGIN : `${API_ORIGIN}/api`;

export const oauthUrl = (provider) => `${API_BASE_URL}/auth/${provider}/redirect`;
