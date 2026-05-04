import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'onDark';
}

/**
 * Single source of Geist Mono styling on the About page.
 * Other components should consume <Eyebrow> rather than reaching for the
 * --font-geist-mono CSS variable directly.
 */
export const Eyebrow = ({ children, className, tone = 'default' }: EyebrowProps) => {
  return (
    <div
      className={cn(
        'text-[11px] uppercase tracking-[0.18em]',
        tone === 'onDark' ? 'text-white/80' : 'text-gray-500',
        className
      )}
      style={{ fontFamily: 'var(--font-geist-mono)' }}
    >
      {children}
    </div>
  );
};
