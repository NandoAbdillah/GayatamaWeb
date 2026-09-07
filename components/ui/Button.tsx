import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber' | 'emerald' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  pill?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      pill = true,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-primary-600 focus:ring-primary shadow-sm hover:shadow active:bg-primary-700',
      secondary:
        'bg-slate-100 dark:bg-navy-900 text-navy-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-navy-800 focus:ring-slate-300 border border-slate-200/80 dark:border-navy-700',
      outline:
        'bg-white dark:bg-navy-900 text-navy-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-navy-800 border border-slate-300 dark:border-navy-700 focus:ring-primary shadow-sm',
      ghost:
        'bg-transparent text-navy-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 focus:ring-slate-300',
      amber:
        'bg-tertiary text-navy-950 hover:bg-tertiary-600 hover:text-white focus:ring-tertiary font-semibold shadow-sm',
      emerald:
        'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary shadow-sm active:bg-secondary-700',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium',
      md: 'text-sm px-5 py-2.5 gap-2 font-medium',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-semibold',
      icon: 'p-2.5 aspect-square',
    };

    const radius = pill ? 'rounded-full' : 'rounded-xl';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], radius, className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
