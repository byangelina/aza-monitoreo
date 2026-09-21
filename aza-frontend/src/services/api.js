import axios from 'axios';

const TOKEN_KEY = 'aza-token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4000/api',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new Event('aza:unauthorized'));
    }
    const message = error.response?.data?.error || 'No pudimos conectar con el servidor. Inténtalo nuevamente.';
    return Promise.reject(new Error(message));
  }
);
