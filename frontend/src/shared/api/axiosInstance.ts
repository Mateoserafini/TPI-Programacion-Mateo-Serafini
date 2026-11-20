import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const detail = error.response?.data?.detail;

    const isAuthCheckOrLogin =
      requestUrl.includes('/auth/token') || requestUrl.includes('/auth/me');

    if ((status === 401 && !isAuthCheckOrLogin) || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);
