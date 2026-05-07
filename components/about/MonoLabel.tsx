import { ReactNode } from 'react';

interface MonoLabelProps {
  children: ReactNode;
  className?: string;
}

export const MonoLabel = ({ children, className }: MonoLabelProps) => (
  <span className={className} style={{ fontFamily: 'var(--font-geist-mono)' }}>
    {children}
  </span>
);
