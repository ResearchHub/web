import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface MonoLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Geist Mono helper for inline labels (stat captions, step counters, tags) that
 * are not section eyebrows. Consolidates inline font-family usage so callers
 * never reference --font-geist-mono directly.
 */
export const MonoLabel = ({ children, className }: MonoLabelProps) => {
  return (
    <span className={cn(className)} style={{ fontFamily: 'var(--font-geist-mono)' }}>
      {children}
    </span>
  );
};
