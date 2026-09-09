# Implementasi Fase 1: Autentikasi & Manajemen Pengguna (Next.js Frontend)

## Tujuan
Membangun sistem autentikasi frontend Next.js yang terhubung ke backend Laravel 12 menggunakan Laravel Sanctum.

## Hubungan dengan Backend Laravel 12
| Endpoint Laravel | Method | Fungsi |
|---|---|---|
| `/api/login` | POST | Autentikasi & dapatkan Sanctum token |
| `/api/register` | POST | Registrasi baru dengan role |
| `/api/register/mahasiswa` | POST | Registrasi mahasiswa (upload KTM) |
| `/api/register/perangkat-desa` | POST | Registrasi perangkat desa (upload SK) |
| `/api/register/universitas` | POST | Registrasi universitas |
| `/api/user` | GET | Ambil profil user yang login |
| `/api/logout` | POST | Logout & revoke token |

## Fitur Frontend yang Akan Diimplementasikan

### 1. Halaman Login (`app/login/page.tsx`)
- Form email + password
- Submit ke `POST /api/login` via API client
- Simpan Sanctum token di `localStorage` atau `httpOnly cookie`
- Redirect berdasarkan role (mahasiswa → dashboard mahasiswa, desa → dashboard desa, dll)
- Validasi input menggunakan `zod` atau `react-hook-form`

### 2. Halaman Register Multi-Role (`app/register/page.tsx`)
- Pilih role: Mahasiswa / Perangkat Desa / Universitas / Dosen
- Redirect ke halaman register sesuai role
- Setiap role memiliki form berbeda:
  - **Mahasiswa**: NIM, nama, angkatan, jurusan, upload KTM → `POST /api/register/mahasiswa`
  - **Perangkat Desa**: Nama desa, alamat, koordinat, upload SK → `POST /api/register/perangkat-desa`
  - **Universitas**: Kode institusi, nama, upload surat → `POST /api/register/universitas`
  - **Dosen**: Diundang oleh admin universitas → tidak ada self-register

### 3. Auth Context & Provider (`context/AuthContext.tsx`)
- Simpan user state & token di context
- Provide function `login()`, `logout()`, `register()` 
- Auto-refresh token sebelum expired
- Check auth status di `middleware.ts`

### 4. Middleware Proteksi Route (`middleware.ts`)
```typescript
// Proteksi route berdasarkan role
const protectedRoutes = {
  '/dashboard/mahasiswa': ['mahasiswa'],
  '/dashboard/perangkat-desa': ['perangkat_desa'],
  '/dashboard/dosen': ['dosen'],
  '/dashboard/admin': ['universitas'],
}
```

### 5. API Client Layer (`lib/api-client.ts`)
```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Accept': 'application/json' }
});

// Interceptor untuk tambahkan Sanctum token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor untuk handle error response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

### 6. Profil Pengguna (`app/mahasiswa/profile/page.tsx`, dll.)
- Tampilkan profil berdasarkan role
- Edit profil (nama, kontak, dll) via `PATCH /api/profile/{role}`
- Upload dokumen verifikasi (KTM, SK) jika status `is_verified = false`

## Teknologi yang Digunakan
- **Framework**: Next.js 14 (App Router)
- **State Management**: React Context + Zustand
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios dengan interceptors
- **UI Components**: shadcn/ui + Tailwind CSS
- **Auth**: Laravel Sanctum token handling
- **Type Safety**: TypeScript interfaces untuk semua models Laravel

## Estimasi Waktu
- **1-2 minggu** untuk 1 frontend developer

## Kriteria Acceptance
- Pengguna dapat register dengan email dan upload dokumen sesuai role
- Autentikasi via Sanctum token bekerja (login → dashboard access)
- Route protection di middleware.ts berfungsi (user tanpa role tidak bisa akses halaman lain)
- Profil user dapat diupdate dengan benar
- Semua form validasi berjalan di sisi client dan server (via Laravel FormRequest)
- Token disimpan aman dan otomatis refresh