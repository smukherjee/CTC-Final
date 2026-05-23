import axios from 'axios';
import { showToast } from './toast';

function resolveUserRole(): string {
  if (typeof window === 'undefined') {
    return 'ADMIN';
  }
  const role = window.localStorage.getItem('ctc_user_role') || window.localStorage.getItem('user_role') || 'ADMIN';
  return String(role).trim().toUpperCase() || 'ADMIN';
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always attach role header expected by finance-protected backend routes.
apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['X-User-Role'] = resolveUserRole();
  return config;
});

// Response interceptor — normalise errors and surface them as toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail;
    const message: string = Array.isArray(detail)
      ? detail
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              return item.msg || item.message || JSON.stringify(item);
            }
            return String(item);
          })
          .join('; ')
      : typeof detail === 'string'
        ? detail
        : error?.message ?? 'An unexpected error occurred';
    // Attach a user-friendly message so callers can display it directly
    error.userMessage = message;
    showToast(message, 'error');
    return Promise.reject(error);
  },
);

export default apiClient;
