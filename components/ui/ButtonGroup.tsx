'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface ButtonGroupOption {
  value: string;
  label: ReactNode;
  badge?: string | number;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'pill';
}

export function ButtonGroup({
  options,
  value,
  onChange,
  className,
  size = 'md',
  variant = 'default',
}: ButtonGroupProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const containerPadding = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
  };

  const containerClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'flex gap-0 border border-gray-300 bg-white rounded-lg';
      case 'pill':
        return 'flex gap-2 p-1 border border-gray-300 bg-white rounded-lg';
      default:
        return cn('flex gap-1 bg-gray-100 rounded-xl', containerPadding[size]);
    }
  };

  const buttonClasses = (isActive: boolean) => {
    switch (variant) {
      case 'outlined':
        return cn(
          'font-medium transition-all flex items-center gap-2 border-r border-gray-300 last:border-r-0 first:rounded-l-lg last:rounded-r-lg whitespace-nowrap',
          sizeClasses[size],
          isActive ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'
        );

      case 'pill':
        return cn(
          'font-medium transition-all flex items-center gap-2 rounded-md whitespace-nowrap',
          sizeClasses[size],
          isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
        );

      default:
        return cn(
          'font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap',
          sizeClasses[size],
          isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        );
    }
  };

  const badgeClasses = (isActive: boolean) => {
    switch (variant) {
      case 'outlined':
        return 'bg-gray-200 text-gray-600 rounded font-medium';
      case 'pill':
        return 'bg-gray-300 text-gray-700 rounded font-medium';
      default:
        return 'bg-gray-200 text-gray-700 rounded font-medium';
    }
  };

  return (
    <div className={cn(containerClasses(), className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={buttonClasses(value === option.value)}
        >
          {option.label}
          {option.badge !== undefined && option.badge !== 0 && (
            <span
              className={cn(
                badgeClasses(value === option.value),
                size === 'sm' ? 'px-1 py-0.5 text-xs' : 'px-1.5 py-0.5 text-xs'
              )}
            >
              {option.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
