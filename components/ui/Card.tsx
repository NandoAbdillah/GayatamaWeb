import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-slate-200/90 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-card transition-all duration-200',
          hoverEffect &&
            'hover:-translate-y-1 hover:shadow-card-hover dark:hover:border-navy-700 hover:border-slate-300 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
