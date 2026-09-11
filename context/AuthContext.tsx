'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { MOCK_USERS } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, mockRole?: UserRole) => Promise<User>;
  register: (role: UserRole, payload: any) => Promise<User>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => void;
  
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sanctum_token');
      const storedUser = localStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Default demo user: Mahasiswa for smooth preview
        const defaultUser = MOCK_USERS.mahasiswa;
        setUser(defaultUser);
        setToken('demo-sanctum-token-mahasiswa-2026');
        localStorage.setItem('sanctum_token', 'demo-sanctum-token-mahasiswa-2026');
        localStorage.setItem('user_data', JSON.stringify(defaultUser));
        document.cookie = `sanctum_token=demo-sanctum-token-mahasiswa-2026; path=/; max-age=86400`;
        document.cookie = `user_role=${defaultUser.role}; path=/; max-age=86400`;
      }
    } catch (e) {
      console.error('Failed to load auth storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthSession = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('sanctum_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    document.cookie = `sanctum_token=${authToken}; path=/; max-age=86400`;
    document.cookie = `user_role=${userData.role}; path=/; max-age=86400`;
  };

  const login = async (email: string, password: string, mockRole?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      // Try real Laravel API endpoint first
      const res = await apiClient.post('/api/login', { email, password });
      if (res.data?.token && res.data?.user) {
        saveAuthSession(res.data.token, res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Backend API unavailable or error, falling back to mock login:', err);
    }

    // Fallback: match mock role or email
    let matchedUser = mockRole ? MOCK_USERS[mockRole] : null;
    if (!matchedUser) {
      if (email.includes('kades') || email.includes('desa')) {
        matchedUser = MOCK_USERS.perangkat_desa;
      } else if (email.includes('dosen') || email.includes('hendra')) {
        matchedUser = MOCK_USERS.dosen;
      } else if (email.includes('lppm') || email.includes('admin') || email.includes('univ')) {
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
      const endpoint =
        role === 'mahasiswa'
          ? '/api/register/mahasiswa'
          : role === 'perangkat_desa'
          ? '/api/register/perangkat-desa'
          : role === 'universitas'
          ? '/api/register/universitas'
          : '/api/register';

      const res = await apiClient.post(endpoint, payload);
      if (res.data?.token && res.data?.user) {
        saveAuthSession(res.data.token, res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Backend register failed or offline, falling back to mock register:', err);
    }

    const newUser: User = {
      id: Date.now(),
      name: payload.name || 'Pengguna Baru KKN',
      email: payload.email || 'user@gayatama.id',
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
      await apiClient.post('/api/logout');
    } catch (e) {
      // ignore
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
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
