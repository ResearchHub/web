import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface BaseSectionProps {
  children: ReactNode;
  className?: string;
  spaceY?: 0 | 4 | 6;
  as?: 'section' | 'div';
}

const spaceYClass = {
  0: '',
  4: 'space-y-4',
  6: 'space-y-6',
} as const;

export function BaseSection({
  children,
  className,
  spaceY = 4,
  as: Component = 'section',
}: BaseSectionProps) {
  return (
    <Component
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        spaceYClass[spaceY],
        className
      )}
    >
      {children}
    </Component>
  );
}
