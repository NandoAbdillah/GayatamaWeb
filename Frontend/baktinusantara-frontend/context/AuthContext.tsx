'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/lib/types';
import authService from '@/lib/services/auth.service';
import { MOCK_USERS } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleHint?: UserRole) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<{ user: User; redirectRoute: string }>;
  register: (role: UserRole, payload: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  switchRoleDemo: (role: UserRole) => Promise<User>;
}

// Seeded account credentials matching Laravel DatabaseSeeder
export const SEEDED_ACCOUNTS: Record<UserRole, { email: string; password: string; name: string }> = {
  mahasiswa: {
    email: 'ketua.ahmad@mhs.unesa.ac.id',
    password: 'password',
    name: 'Ahmad Fauzi',
  },
  perangkat_desa: {
    email: 'desa.sukamaju@desa.id',
    password: 'password',
    name: 'Kantor Kepala Desa Sukamaju',
  },
  dosen: {
    email: 'dosen.budi@unesa.ac.id',
    password: 'password',
    name: 'Dr. Budi Santoso, M.Kom.',
  },
  universitas: {
    email: 'unesa@unesa.ac.id',
    password: 'password',
    name: 'Lembaga Pengabdian Masyarakat UNESA',
  },
  admin: {
    email: 'admin@baktinusantara.id',
    password: 'password',
    name: 'Super Admin BaktiNusantara',
  },
  masyarakat: {
    email: 'ketua.ahmad@mhs.unesa.ac.id',
    password: 'password',
    name: 'Warga / Masyarakat Umum',
  },
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuthSession = useCallback((authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('sanctum_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    document.cookie = `sanctum_token=${authToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `user_role=${userData.role}; path=/; max-age=86400; SameSite=Lax`;
  }, []);

  const clearAuthSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('user_data');
    document.cookie = 'sanctum_token=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentToken = localStorage.getItem('sanctum_token');
      if (!currentToken) {
        return null;
      }
      const freshUser = await authService.getMe();
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user_data', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (e: any) {
      console.warn('Could not refresh user from backend:', e);
      if (e?.response?.status === 401) {
        clearAuthSession();
        return null;
      }
    }
    return user;
  }, [user, clearAuthSession]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const storedToken = localStorage.getItem('sanctum_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (isMounted) {
            setToken(storedToken);
            setUser(parsedUser);
          }

          // Verify token against Laravel backend
          try {
            const freshUser = await authService.getMe();
            if (freshUser && isMounted) {
              setUser(freshUser);
              localStorage.setItem('user_data', JSON.stringify(freshUser));
            }
          } catch (apiErr: any) {
            if (apiErr?.response?.status === 401 && isMounted) {
              clearAuthSession();
            }
          }
        }
      } catch (e) {
        console.error('Failed to load auth storage', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuthSession]);

  const login = async (email: string, password: string, roleHint?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      // 1. Real Laravel Sanctum Login
      const res = await authService.login({ email, password });
      if (res?.token) {
        localStorage.setItem('sanctum_token', res.token);
        
        let loggedUser: User;
        try {
          loggedUser = await authService.getMe();
        } catch {
          loggedUser = {
            id: 1,
            name: email.split('@')[0],
            email,
            role: (res.role || roleHint || 'mahasiswa') as UserRole,
            is_verified: res.is_verified ?? true,
          };
        }

        saveAuthSession(res.token, loggedUser);
        setIsLoading(false);
        return loggedUser;
      }
      throw new Error('Gagal mendapatkan token otentikasi');
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err?.response?.data?.message || err?.message || 'Email atau kata sandi tidak valid';
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<{ user: User; redirectRoute: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.loginGoogle(idToken);
      if (res?.success && res?.token && res?.user) {
        saveAuthSession(res.token, res.user);
        setIsLoading(false);
        return {
          user: res.user,
          redirectRoute: res.redirect_route || '/mahasiswa/dashboard',
        };
      }
      throw new Error(res?.message || 'Login Google gagal');
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (role: UserRole, payload: any): Promise<User> => {
    setIsLoading(true);
    try {
      let regRes: any;
      if (role === 'mahasiswa') {
        regRes = await authService.registerMahasiswa(payload);
      } else if (role === 'perangkat_desa') {
        regRes = await authService.registerDesa(payload);
      } else if (role === 'universitas') {
        regRes = await authService.registerUniversitas(payload);
      }

      // Automatically log in with the new credentials
      const email = payload instanceof FormData ? (payload.get('email') as string) : payload.email;
      const password = payload instanceof FormData ? (payload.get('password') as string) : payload.password;

      if (email && password) {
        try {
          const loggedUser = await login(email, password, role);
          setIsLoading(false);
          return loggedUser;
        } catch {
          // If auto-login fails, build user object from registration response
          const newUser: User = {
            id: regRes?.data?.id || Date.now(),
            name: (payload instanceof FormData ? payload.get('name') : payload.name) || 'Pengguna Terdaftar',
            email,
            role,
            is_verified: false,
          };
          saveAuthSession(`token-${Date.now()}`, newUser);
          setIsLoading(false);
          return newUser;
        }
      }

      const defaultUser: User = {
        id: Date.now(),
        name: 'Pengguna Terdaftar',
        email: 'user@baktinusantara.id',
        role,
        is_verified: false,
      };
      saveAuthSession(`token-${Date.now()}`, defaultUser);
      setIsLoading(false);
      return defaultUser;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err?.response?.data?.message || err?.message || 'Registrasi gagal. Periksa kembali kelengkapan data.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuthSession();
      setIsLoading(false);
    }
  };

  const switchRoleDemo = async (role: UserRole): Promise<User> => {
    const creds = SEEDED_ACCOUNTS[role] || SEEDED_ACCOUNTS.mahasiswa;
    try {
      return await login(creds.email, creds.password, role);
    } catch (e) {
      console.warn('Backend login for seeded role failed, using fallback mock session:', e);
      const mockUser = MOCK_USERS[role] || MOCK_USERS.mahasiswa;
      saveAuthSession(`demo-token-${role}-${Date.now()}`, mockUser);
      return mockUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

