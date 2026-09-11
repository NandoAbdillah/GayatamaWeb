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
   * Logout and invalidate token
   * Endpoint: POST /api/logout
   */
  async logout(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/logout');
    return res.data;
  },
};

export default authService;
