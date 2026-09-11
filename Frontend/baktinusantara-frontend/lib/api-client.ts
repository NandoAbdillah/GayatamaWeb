import axios, { AxiosError, AxiosInstance } from 'axios';

// Normalize base URL: Ensure default is local Laravel (http://127.0.0.1:8000) and trim trailing slash
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Core Axios Client configured for Laravel 12 REST API & Sanctum
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: false,
});

/**
 * Request Interceptor: Automatically injects Sanctum Bearer Token
 */
apiClient.interceptors.request.use(
  (config) => {
    // If request data is FormData, remove Content-Type so browser sets boundary automatically
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

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

/**
 * Response Interceptor: Handles 401 unauthenticated session expiry
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Clear session artifacts
      localStorage.removeItem('sanctum_token');
      localStorage.removeItem('user_data');
      document.cookie = 'sanctum_token=; path=/; max-age=0';
      document.cookie = 'user_role=; path=/; max-age=0';

      const pathname = window.location.pathname;
      const isProtectedRoute =
        pathname.startsWith('/mahasiswa') ||
        pathname.startsWith('/perangkat-desa') ||
        pathname.startsWith('/dosen') ||
        pathname.startsWith('/universitas') ||
        pathname.startsWith('/admin');

      if (isProtectedRoute && !pathname.includes('/login')) {
        window.location.href = `/login?expired=1&redirect=${encodeURIComponent(pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Laravel API Error structure helper
 */
export interface LaravelValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Formats any caught API error into a friendly message or validation bag
 */
export function formatApiError(error: unknown): {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
} {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as LaravelValidationError | undefined;
    const status = error.response?.status;

    if (status === 422 && data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstMsg = data.errors[firstKey]?.[0] || 'Validasi gagal.';
      return {
        message: data.message || firstMsg,
        fieldErrors: data.errors,
        status,
      };
    }

    if (data?.message) {
      return { message: data.message, status };
    }

    if (error.message === 'Network Error') {
      return {
        message: 'Koneksi ke backend Laravel gagal. Pastikan backend berjalan di ' + API_BASE_URL,
        status,
      };
    }

    return {
      message: error.message || 'Terjadi kesalahan pada server.',
      status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Terjadi kesalahan yang tidak diketahui.' };
}

export default apiClient;
