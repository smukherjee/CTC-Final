import axios from 'axios';
import { showToast } from './toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — normalise errors and surface them as toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error?.response?.data?.detail ??
      error?.message ??
      'An unexpected error occurred';
    // Attach a user-friendly message so callers can display it directly
    error.userMessage = message;
    showToast(message, 'error');
    return Promise.reject(error);
  },
);

export default apiClient;
