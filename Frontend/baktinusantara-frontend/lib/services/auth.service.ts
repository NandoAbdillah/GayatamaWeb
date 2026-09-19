import apiClient from '@/lib/api-client';
import { User, UserRole } from '@/lib/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user?: User;
  role?: UserRole;
  is_verified?: boolean;
}

export interface MahasiswaRegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_wa: string;
  universitas_id: number | string;
  nim: string;
  jurusan: string;
  semester: number | string;
  ktm_file?: File | Blob;
}

export interface DesaRegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_wa: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  latitude?: number | string;
  longitude?: number | string;
  sk_file?: File | Blob;
}

export interface UniversitasRegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_wa: string;
  nama_universitas: string;
  kode_univ: string;
}

export const authService = {
  /**
   * Login user with email and password
   * Endpoint: POST /api/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/api/login', credentials);
    return res.data;
  },

  /**
   * Register Mahasiswa with optional KTM upload
   * Endpoint: POST /api/register/mahasiswa
   */
  async registerMahasiswa(payload: MahasiswaRegisterPayload | FormData): Promise<any> {
    let body: any = payload;
    if (!(payload instanceof FormData)) {
      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value instanceof Blob ? value : String(value));
        }
      });
      body = fd;
    }
    const res = await apiClient.post('/api/register/mahasiswa', body);
    return res.data;
  },

  /**
   * Register Perangkat Desa with optional SK upload
   * Endpoint: POST /api/register/desa
   */
  async registerDesa(payload: DesaRegisterPayload | FormData): Promise<any> {
    let body: any = payload;
    if (!(payload instanceof FormData)) {
      const fd = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value instanceof Blob ? value : String(value));
        }
      });
      body = fd;
    }
    const res = await apiClient.post('/api/register/desa', body);
    return res.data;
  },

  /**
   * Register Universitas
   * Endpoint: POST /api/register/universitas
   */
  async registerUniversitas(payload: UniversitasRegisterPayload): Promise<any> {
    const res = await apiClient.post('/api/register/universitas', payload);
    return res.data;
  },

  /**
   * Get currently authenticated user profile
   * Endpoint: GET /api/user
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/api/user');
    return res.data;
  },

  /**
   * Login with Google ID token / credential
   * Endpoint: POST /api/auth/google/token
   */
  async loginGoogle(idTokenOrCredential: string): Promise<any> {
    const res = await apiClient.post('/api/auth/google/token', {
      id_token: idTokenOrCredential,
      credential: idTokenOrCredential,
    });
    return res.data;
  },

  /**
   * Logout and invalidate token
   * Endpoint: POST /api/logout
   */
  async logout(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/logout');
    return res.data;
  },

  /**
   * Request OTP for forgot password
   * Endpoint: POST /api/forgot-password
   */
  async forgotPassword(payload: { identifier: string; channel?: 'whatsapp' | 'sms' | 'email' }): Promise<{
    success: boolean;
    message: string;
    target?: string;
    channel?: string;
    purpose?: string;
    expires_in_minutes?: number;
    dev_otp?: string;
  }> {
    const res = await apiClient.post('/api/forgot-password', payload);
    return res.data;
  },

  /**
   * Verify OTP code
   * Endpoint: POST /api/otp/verify
   */
  async verifyOtp(payload: { identifier: string; otp: string; purpose?: string }): Promise<{
    valid: boolean;
    message: string;
  }> {
    const res = await apiClient.post('/api/otp/verify', payload);
    return res.data;
  },

  /**
   * Reset Password with OTP
   * Endpoint: POST /api/reset-password
   */
  async resetPassword(payload: {
    identifier: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post('/api/reset-password', payload);
    return res.data;
  },

  /**
   * Resend OTP
   * Endpoint: POST /api/otp/resend
   */
  async resendOtp(payload: {
    identifier: string;
    purpose?: string;
    channel?: 'whatsapp' | 'sms' | 'email';
  }): Promise<{
    success: boolean;
    message: string;
    target?: string;
    channel?: string;
    purpose?: string;
    expires_in_minutes?: number;
    dev_otp?: string;
  }> {
    const res = await apiClient.post('/api/otp/resend', payload);
    return res.data;
  },

  /**
   * Forgot Email lookup
   * Endpoint: POST /api/forgot-email
   */
  async forgotEmail(payload: { identifier: string; channel?: 'whatsapp' | 'sms' | 'email' }): Promise<any> {
    const res = await apiClient.post('/api/forgot-email', payload);
    return res.data;
  },
};

export default authService;
