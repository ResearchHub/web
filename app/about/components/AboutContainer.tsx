import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface AboutContainerProps {
  children: ReactNode;
  className?: string;
}

export const AboutContainer = ({ children, className }: AboutContainerProps) => (
  <div className={cn('max-w-[1120px] mx-auto px-4 sm:px-6 md:px-10', className)}>{children}</div>
);
