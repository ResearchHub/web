'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

export interface PillBinaryProps {
  label: string;
  active: boolean;
  onChange: (active: boolean) => void;
  className?: string;
}

export const PillBinary: FC<PillBinaryProps> = ({ label, active, onChange, className }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 select-none whitespace-nowrap',
        active ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      {label}
    </button>
  );
};
