import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return <thead className={cn('bg-gray-50', className)}>{children}</thead>;
}
