# Next.js ↔ Laravel 12 Integration Pattern — Technical Documentation

## Overview
This document describes the technical integration pattern between the Next.js 14 frontend and Laravel 12 backend for the KKN Management System.

---

## 1. Authentication Flow

### 1.1 Login
```
1. User submits email + password on Login page
2. Frontend calls: POST /api/login (via Axios)
3. Laravel validates credentials → returns Sanctum token
4. Frontend stores token in localStorage (or httpOnly cookie)
5. Axios interceptor automatically adds Authorization header:
   headers: { Authorization: `Bearer ${token}` }
```

### 1.2 Token Storage & Refresh
```typescript
// lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Attempt refresh token or redirect to login
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

### 1.3 Registration Flow
```
1. User selects role → redirects to /register/{role}
2. Frontend renders role-specific form
3. Upload files (KTM, SK, surat) via multipart/form-data
4. POST to role-specific endpoint:
   - Mahasiswa: POST /api/register/mahasiswa
   - Perangkat Desa: POST /api/register/perangkat-desa
   - Universitas: POST /api/register/universitas
5. Laravel validates via FormRequest → creates user + profile
6. Frontend redirects to login with success message
```

---

## 2. File Upload Pattern

### 2.1 Architecture
```
Frontend → Next.js API Route → Laravel (upload to private disk)
Laravel returns signed URL → Frontend displays via signed URL
```

### 2.2 Next.js API Route Proxy
```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const data = new FormData();
  data.append('file', file);

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sanctum_token')}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return NextResponse.json(response.data);
}
```

### 2.3 Laravel Configuration
```php
// config/filesystems.php
'sdisks' => [
    'private' => [
        'driver' => 'local',
        'root' => storage_path('app/private'),
        'visibility' => 'private',
    ],
];

// Generate signed URL for frontend access
$url = Storage::disk('private')->signedUrl($path, now()->addHours(24));
```

### 2.4 Frontend File Display
```tsx
// Display signed URL as download link
<a href={signedUrl} download>Download File</a>
// Or embed in view
<iframe src={signedUrl} />
```

---

## 3. CORS Configuration

### 3.1 Laravel Backend
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => [
        'https://gayatama-web.vercel.app',
        'http://localhost:3000', // for development
    ],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    'max_age' => 86400,
];
```

### 3.2 Frontend Axios Configuration
```typescript
// lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for Sanctum
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
```

### 3.3 Alternative: Next.js API Proxy (if CORS issues persist)
```typescript
// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${path}`, {
    headers: {
      'Authorization': request.headers.get('Authorization') || '',
    },
  });
  return NextResponse.json(await response.json());
}

export { GET as POST, GET as PATCH, GET as DELETE, GET as PUT };
```

---

## 4. API Response Handling

### 4.1 Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### 4.2 Error Response Format
```json
{
  "success": false,
  "errors": {
    "field": ["error message"]
  },
  "message": "Validation failed"
}
```

### 4.3 Frontend Error Handling
```typescript
// lib/api-client.ts (extended)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.errors) {
      // Form validation errors → display field-level errors
      return Promise.reject(error.response.data.errors);
    }
    if (error.response?.status === 401) {
      router.push('/login');
    }
    if (error.response?.status === 422) {
      // Validation errors
      return Promise.reject(error.response.data);
    }
    // Generic error
    return Promise.reject(new Error('Something went wrong'));
  }
);
```

---

## 5. Role-Based Access Control (Frontend)

### 5.1 Middleware Protection
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sanctum_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const roleRoutes: Record<string, string[]> = {
    '/mahasiswa': ['mahasiswa'],
    '/perangkat-desa': ['perangkat_desa'],
    '/dosen': ['dosen'],
    '/admin': ['universitas', 'admin'],
  };

  for (const [path, roles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(path)) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (!roles.includes(userRole || '')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 5.2 Role-Based UI Rendering
```tsx
// components/RoleGate.tsx
'use client';
import { useAuth } from '@/context/AuthContext';

export function RoleGate({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user?.role || '')) {
    return <div>Access denied</div>;
  }
  
  return <>{children}</>;
}
```

---

## 6. Matching Score & Distance Calculation

### 6.1 Backend Calculation (Laravel Service)
```php
// app/Services/MatchingService.php
public function calculateMatching(PosKebutuhan $pos, Mahasiswa $mahasiswa): array
{
    $distance = $this->haversineDistance(
        $pos->lat, $pos->lon,
        $mahasiswa->lat, $mahasiswa->lon
    );
    
    $majorMatch = ($pos->jurusan_dibutuhkan === $mahasiswa->jurusan) ? 100 : 0;
    $urgencyScore = match($pos->urgency) {
        'Tinggi' => 50, 'Sedang' => 30, default => 10
    };
    
    $matchingScore = ($majorMatch * 0.4) + ($urgencyScore * 0.3) + ((100 - min($distance * 2, 100)) * 0.3);
    
    return [
        'distance_km' => round($distance, 2),
        'matching_score' => round($matchingScore, 1),
        'major_match' => $majorMatch > 0,
    ];
}
```

### 6.2 Frontend Display
```tsx
// components/MatchingScoreBadge.tsx
export function MatchingScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
  return (
    <Badge color={color}>
      Cocok {score}%
    </Badge>
  );
}
```

### 6.3 Distance Warning
```tsx
// components/DistanceWarning.tsx
export function DistanceWarning({ distanceKm }: { distanceKm: number }) {
  const THRESHOLD = 50; // configurable from backend
  if (distanceKm > THRESHOLD) {
    return (
      <Alert>
        ⚠️ Jarak {distanceKm}km melebihi batas ({THRESHOLD}km).
        Wajib upload surat izin orang tua.
      </Alert>
    );
  }
  return null;
}
```

---

## 7. Double-Confirm Pattern (Progres Mingguan)

### 7.1 Frontend Flow
```tsx
// app/mahasiswa/progress/submit/page.tsx
export default function ProgressSubmitPage() {
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm, 3 = submitted
  const [isLocked, setIsLocked] = useState(false);

  // Check if already locked
  const { data } = useQuery(['progress', proposalId], () => 
    fetchProgress(proposalId)
  );
  
  if (data?.is_locked) {
    return <LockedView />;
  }

  if (step === 1) {
    return <ProgressForm onSubmit={() => setStep(2)} />;
  }
  
  if (step === 2) {
    return (
      <ConfirmModal
        title="Konfirmasi Submit"
        message="Progres ini tidak bisa diedit setelah disubmit. Yakin?"
        onConfirm={() => { submitProgress(); setStep(3); setIsLocked(true); }}
        onCancel={() => setStep(1)}
      />
    );
  }
  
  return <SubmittedView />;
}
```

### 7.2 Backend Lock Mechanism
```php
// In ProgressController
public function update(Request $request, Progress $progress)
{
    if ($progress->is_locked) {
        return response()->json([
            'success' => false,
            'message' => 'Progres ini sudah dikunci dan tidak dapat diedit.'
        ], 422);
    }
    
    // Update logic...
}
```

---

## 8. Real-time Status Updates (Polling Pattern)

### 8.1 Polling Implementation
```typescript
// hooks/usePolling.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function usePolling(queryKey: string[], queryFn: () => Promise<any>, interval = 30000) {
  const queryClient = useQueryClient();
  
  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
    refetchInterval: interval, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  });
  
  return { data, ...rest };
}
```

### 8.2 Status Badge Component
```tsx
// components/StatusBadge.tsx
const STATUS_COLORS = {
  menunggu: 'yellow',
  terverifikasi: 'green',
  ditolak: 'red',
  approved: 'green',
  rejected: 'red',
  on_track: 'green',
  terlambat: 'red',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge color={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'gray'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
```

---

## 9. WhatsApp Notification Integration

### 9.1 Backend (Laravel Job)
```php
// app/Jobs/SendWaNotification.php
public function handle()
{
    $waClient = new FonnteClient(config('services.fonnte.key'));
    
    $waClient->send([
        'to' => $this->phoneNumber,
        'message' => $this->message,
    ]);
}
```

### 9.2 Frontend Feedback
```tsx
// components/NotificationFeedback.tsx
export function NotificationFeedback({ status }: { status: 'sending' | 'sent' | 'failed' }) {
  if (status === 'sending') {
    return <Toast loading="Mengirim notifikasi..." />;
  }
  if (status === 'sent') {
    return <Toast success="Notifikasi WA dikirim!" />;
  }
  return <Toast error="Gagal mengirim notifikasi. Coba lagi." />;
}
```

---

## 10. Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
# Production: https://api.gayatama-web.com
NEXT_PUBLIC_APP_NAME=Gayatama KKN
```

### Backend (.env)
```bash
SANCTUM_STATEFUL_DOMAINS=gayatama-web.vercel.app,localhost:3000
CORS_ALLOWED_ORIGINS=https://gayatama-web.vercel.app,http://localhost:3000
FONNTE_API_KEY=your_fonnte_key
```

---

## 11. Error Handling Summary

| Error Type | Frontend Action | Backend Response |
|-----------|----------------|-----------------|
| 401 Unauthorized | Redirect to login, clear token | Sanctum token expired/invalid |
| 422 Validation | Display field errors | Laravel validation errors |
| 403 Forbidden | Show access denied page | Role mismatch |
| 500 Server Error | Show error message, retry | Internal server error |
| Network Error | Show offline message | Connection failed |
| File Upload Error | Show file size/type error | Laravel upload validation |

---

## 12. Testing Integration

### Manual Testing Checklist
1. Login → Verify token stored → Navigate to protected route → Access granted
2. Register as each role → Verify redirect → Verify profile created in backend
3. File upload → Verify Laravel receives → Verify signed URL returned → Verify download works
4. API call without token → Verify 401 → Verify redirect to login
5. CORS preflight → Verify OPTIONS request → Verify headers present
6. Matching score calculation → Verify distance formula → Verify score within expected range
7. Double-confirm → Verify first click shows modal → Verify second click submits → Verify is_locked = true

### API Testing Tools
- **Postman**: Import collection from backend API docs
- **Browser DevTools**: Check Network tab for request/response
- **Laravel Telescope**: Monitor backend requests and errors
- **React DevTools**: Inspect component state and props

---

## 13. Deployment Checklist

### Frontend Deployment (Vercel)
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Configure Vercel project settings
- [ ] Set up custom domain (if applicable)
- [ ] Verify CORS origins match production domain
- [ ] Test all API routes in production
- [ ] Verify Sanctum token works in production
- [ ] Test file upload/download in production
- [ ] Verify HTTPS (required for Sanctum)

### Backend Deployment
- [ ] Configure `.env` for production
- [ ] Set `SANCTUM_STATEFUL_DOMAINS` correctly
- [ ] Configure database connection
- [ ] Run `php artisan migrate`
- [ ] Set up queue worker (for WhatsApp notifications)
- [ ] Configure storage permissions
- [ ] Set up cron jobs (for scheduled tasks)

---

## 14. Common Issues & Solutions

### Issue: 401 on API calls after login
- **Cause**: Token not being sent with request
- **Solution**: Check Axios interceptor, ensure token stored in localStorage

### Issue: CORS errors in browser
- **Cause**: Origin mismatch between frontend and backend
- **Solution**: Update `allowed_origins` in Laravel CORS config

### Issue: File upload failing with 413 error
- **Cause**: File size exceeds PHP/Laravel limit
- **Solution**: Increase `upload_max_filesize` and `post_max_size` in php.ini

### Issue: Sanctum token expires too quickly
- **Cause**: Token lifetime too short
- **Solution**: Increase `config/sanctum.php` lifetime or implement refresh token

### Issue: Haversine query very slow
- **Cause**: No spatial index on lat/lon columns
- **Solution**: Add SPATIAL INDEX or use MySQL spatial functions

### Issue: Matching score not displayed
- **Cause**: Frontend not fetching matching data
- **Solution**: Check API call includes matching calculation parameters