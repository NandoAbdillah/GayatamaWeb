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
  login: (email: string, password: string, mockRole?: UserRole) => Promise<User>;
  register: (role: UserRole, payload: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  switchRoleDemo: (role: UserRole) => void;
}

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

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentToken = localStorage.getItem('sanctum_token');
      if (!currentToken || currentToken.startsWith('mock-') || currentToken.startsWith('demo-')) {
        return user;
      }
      const freshUser = await authService.getMe();
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user_data', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (e) {
      console.warn('Could not refresh user from backend:', e);
    }
    return user;
  }, [user]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sanctum_token');
      const storedUser = localStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Silently attempt to fetch real profile if not demo token
        if (!storedToken.startsWith('demo-') && !storedToken.startsWith('mock-')) {
          authService.getMe()
            .then((freshUser) => {
              if (freshUser) {
                setUser(freshUser);
                localStorage.setItem('user_data', JSON.stringify(freshUser));
              }
            })
            .catch(() => {
              // keep stored user if offline
            });
        }
      } else {
        // Default demo user: Mahasiswa for initial exploration
        const defaultUser = MOCK_USERS.mahasiswa;
        setUser(defaultUser);
        setToken('demo-sanctum-token-mahasiswa-2026');
        localStorage.setItem('sanctum_token', 'demo-sanctum-token-mahasiswa-2026');
        localStorage.setItem('user_data', JSON.stringify(defaultUser));
        document.cookie = `sanctum_token=demo-sanctum-token-mahasiswa-2026; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_role=${defaultUser.role}; path=/; max-age=86400; SameSite=Lax`;
      }
    } catch (e) {
      console.error('Failed to load auth storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, mockRole?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      // 1. Try real Laravel backend Sanctum login
      const res = await authService.login({ email, password });
      if (res?.token) {
        let loggedUser: User;
        if (res.user) {
          loggedUser = res.user;
        } else {
          // Fetch authenticated user profile with Sanctum token
          localStorage.setItem('sanctum_token', res.token);
          try {
            loggedUser = await authService.getMe();
          } catch {
            loggedUser = {
              id: 1,
              name: email.split('@')[0],
              email,
              role: (res.role || 'mahasiswa') as UserRole,
              is_verified: res.is_verified ?? true,
            };
          }
        }
        saveAuthSession(res.token, loggedUser);
        setIsLoading(false);
        return loggedUser;
      }
    } catch (err) {
      console.warn('Backend login unavailable or credentials error, checking mock fallback:', err);
    }

    // Fallback: match mock role or email
    let matchedUser = mockRole ? MOCK_USERS[mockRole] : null;
    if (!matchedUser) {
      if (email.includes('kades') || email.includes('desa')) {
        matchedUser = MOCK_USERS.perangkat_desa;
      } else if (email.includes('dosen') || email.includes('budi') || email.includes('hendra')) {
        matchedUser = MOCK_USERS.dosen;
      } else if (email.includes('lppm') || email.includes('admin') || email.includes('univ') || email.includes('unesa')) {
        matchedUser = MOCK_USERS.universitas;
      } else {
        matchedUser = MOCK_USERS.mahasiswa;
      }
    }

    const demoToken = `mock-sanctum-token-${matchedUser.role}-${Date.now()}`;
    saveAuthSession(demoToken, matchedUser);
    setIsLoading(false);
    return matchedUser;
  };

  const register = async (role: UserRole, payload: any): Promise<User> => {
    setIsLoading(true);
    try {
      let res: any;
      if (role === 'mahasiswa') {
        res = await authService.registerMahasiswa(payload);
      } else if (role === 'perangkat_desa') {
        res = await authService.registerDesa(payload);
      } else if (role === 'universitas') {
        res = await authService.registerUniversitas(payload);
      }

      if (res?.token && res?.user) {
        saveAuthSession(res.token, res.user);
        setIsLoading(false);
        return res.user;
      }
    } catch (err) {
      console.warn('Backend register error, fallback to mock register:', err);
    }

    const newUser: User = {
      id: Date.now(),
      name: payload?.name || payload?.nama_desa || 'Pengguna Baru KKN',
      email: payload?.email || 'user@baktinusantara.id',
      role: role,
      is_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    saveAuthSession(`mock-registered-token-${Date.now()}`, newUser);
    setIsLoading(false);
    return newUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout network errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('sanctum_token');
      localStorage.removeItem('user_data');
      document.cookie = 'sanctum_token=; path=/; max-age=0';
      document.cookie = 'user_role=; path=/; max-age=0';
    }
  };

  const switchRoleDemo = (role: UserRole) => {
    const targetUser = MOCK_USERS[role] || MOCK_USERS.mahasiswa;
    saveAuthSession(`demo-switch-${role}-${Date.now()}`, targetUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
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
