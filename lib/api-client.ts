import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: false,
});

// Request Interceptor to attach Sanctum token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sanctum_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling errors and session expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('sanctum_token');
      localStorage.removeItem('user_data');
      document.cookie = 'sanctum_token=; path=/; max-age=0';
      document.cookie = 'user_role=; path=/; max-age=0';
      // Only redirect if on protected routes
      const pathname = window.location.pathname;
      if (
        pathname.startsWith('/mahasiswa') ||
        pathname.startsWith('/perangkat-desa') ||
        pathname.startsWith('/dosen') ||
        pathname.startsWith('/admin')
      ) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
