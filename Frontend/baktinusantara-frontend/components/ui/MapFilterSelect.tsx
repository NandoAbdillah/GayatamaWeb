'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface MapFilterOption {
  value: string | number;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface MapFilterSelectProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  options: MapFilterOption[];
  icon?: React.ReactNode;
  prefixLogo?: React.ReactNode;
  placeholder?: string;
  placeholderSearch?: string;
  className?: string;
  dropdownWidth?: string;
  badge?: string;
  searchable?: boolean;
}

export const MapFilterSelect: React.FC<MapFilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  icon,
  prefixLogo,
  placeholder = 'Pilih...',
  placeholderSearch,
  className = '',
  dropdownWidth = 'min-w-[210px]',
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside & reset search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth drop-down: turun halus dari atas
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure element is mounted and visible
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(t);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const currentLabel = selectedOption ? selectedOption.label : placeholder;

  const isSearchEnabled = searchable && options.length > 1;

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    return opt.label.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  return (
    <div ref={containerRef} className={`relative min-w-0 ${shouldRender ? 'z-[9999]' : 'z-0'} ${className}`} style={shouldRender ? { isolation: 'isolate' } : undefined}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border text-left transition-all duration-200 select-none shadow-xs min-w-0 ${
          isOpen
            ? 'bg-white dark:bg-navy-900 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
            : 'bg-slate-50/90 dark:bg-navy-950/90 hover:bg-white dark:hover:bg-navy-900 border-slate-200/90 dark:border-navy-800 hover:border-emerald-400 dark:hover:border-emerald-700'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {prefixLogo ? (
            <div className="shrink-0">{prefixLogo}</div>
          ) : icon ? (
            <div className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</div>
          ) : null}

          <div className="min-w-0 flex-1 leading-tight">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
              {label}
            </span>
            <span className="text-xs font-bold text-navy-950 dark:text-white truncate block">
              {currentLabel}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown with Search */}
      {shouldRender && (
        <div
          className={`absolute top-full left-0 mt-1.5 ${dropdownWidth} max-w-[calc(100vw-32px)] bg-white dark:bg-navy-900 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-navy-700 shadow-2xl z-[9999] overflow-hidden flex flex-col p-1 will-change-transform transition-all duration-260 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] -translate-y-2 pointer-events-none'
          } max-h-72`}
          style={{ isolation: 'isolate' }}
        >
          {/* In-Dropdown Search Header */}
          {isSearchEnabled && (
            <div className="p-1.5 border-b border-slate-100 dark:border-navy-800 shrink-0">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsOpen(false);
                    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
                      onChange(filteredOptions[0].value);
                      setIsOpen(false);
                    }
                  }}
                  placeholder={placeholderSearch || `Cari ${label.toLowerCase()}...`}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-slate-100/60 dark:divide-navy-800/60 scrollbar-thin flex-1 max-h-56">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-slate-400 font-medium">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'text-navy-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilterSelect;

