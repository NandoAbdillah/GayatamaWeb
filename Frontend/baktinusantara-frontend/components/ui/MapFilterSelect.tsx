'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
  className?: string;
  dropdownWidth?: string;
  badge?: string;
}

export const MapFilterSelect: React.FC<MapFilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  icon,
  prefixLogo,
  placeholder = 'Pilih...',
  className = '',
  dropdownWidth = 'min-w-[190px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const currentLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border text-left transition-all duration-200 select-none shadow-xs ${
          isOpen
            ? 'bg-white dark:bg-navy-900 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
            : 'bg-slate-50/90 dark:bg-navy-950/90 hover:bg-white dark:hover:bg-navy-900 border-slate-200/90 dark:border-navy-800 hover:border-emerald-400 dark:hover:border-emerald-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {prefixLogo ? (
            <div className="shrink-0">{prefixLogo}</div>
          ) : icon ? (
            <div className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</div>
          ) : null}

          <div className="min-w-0 leading-tight">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {label}
            </span>
            <span className="text-xs font-bold text-navy-950 dark:text-white truncate block max-w-[125px] sm:max-w-[145px]">
              {currentLabel}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1.5 ${dropdownWidth} bg-white/95 dark:bg-navy-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-navy-700 shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800 p-1 animate-in fade-in zoom-in-95 duration-150`}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
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
          })}
        </div>
      )}
    </div>
  );
};

export default MapFilterSelect;
