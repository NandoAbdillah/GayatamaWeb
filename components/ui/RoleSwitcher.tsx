'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { GraduationCap, Home, BookOpen, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const RoleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { user, switchRoleDemo } = useAuth();
  const router = useRouter();

  const roles: { role: UserRole; label: string; icon: React.ElementType; dashboard: string }[] = [
    { role: 'mahasiswa', label: 'Mahasiswa', icon: GraduationCap, dashboard: '/mahasiswa/dashboard' },
    { role: 'perangkat_desa', label: 'Mitra Desa', icon: Home, dashboard: '/perangkat-desa/dashboard' },
    { role: 'dosen', label: 'Dosen (DPL)', icon: BookOpen, dashboard: '/dosen/dashboard' },
    { role: 'universitas', label: 'LPPM / Admin', icon: ShieldCheck, dashboard: '/admin/dashboard' },
  ];

  const handleRoleChange = (item: (typeof roles)[0]) => {
    switchRoleDemo(item.role);
    router.push(item.dashboard);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-surface-container-high/90 backdrop-blur-md p-1.5 rounded-full border border-primary-200/60 shadow-ambient',
        className
      )}
    >
      <span className="text-[11px] font-semibold text-navy-700 px-2.5 py-0.5 uppercase tracking-wider">
        Mode Demo:
      </span>
      {roles.map((item) => {
        const Icon = item.icon;
        const isActive = user?.role === item.role;
        return (
          <button
            key={item.role}
            onClick={() => handleRoleChange(item)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-navy-800 hover:bg-surface-subtle/80 hover:text-primary-700'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
