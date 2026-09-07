'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 animate-pulse',
          className
        )}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
        isDark
          ? 'bg-navy-900 text-amber-400 border border-navy-700 hover:bg-navy-800'
          : 'bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-slate-200/80 hover:text-navy-950',
        className
      )}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};
