'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface StyledSelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface StyledSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  label?: string;
  disabled?: boolean;
}

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  label,
  disabled = false,
}: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-[9999]' : 'z-0'} ${className}`} style={isOpen ? { isolation: 'isolate' } : undefined}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`inline-flex w-full items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-950 dark:text-slate-100 border border-slate-200/80 dark:border-navy-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span className="truncate text-left flex-1">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-2 w-full min-w-[180px] origin-top rounded-2xl bg-white dark:bg-navy-900 p-1.5 shadow-2xl ring-1 ring-slate-900/10 dark:ring-black/40 border border-slate-100 dark:border-navy-800 z-[9999] animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-auto ${dropdownClassName}`}
          style={{ isolation: 'isolate' }}
        >
          {label && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-navy-800/80 mb-1">
              {label}
            </div>
          )}
          <div className="space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary/10 text-primary dark:text-primary-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StyledSelect;
