import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn('bg-white divide-y divide-gray-200', className)}>{children}</tbody>;
}
