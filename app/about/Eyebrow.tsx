import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'onDark';
}

/**
 * Section-level label rendered in Geist Mono. Use for eyebrow text above
 * headings. For inline mono labels (stat captions, step counters, tags),
 * use <MonoLabel> instead.
 */
export const Eyebrow = ({ children, className, tone = 'default' }: EyebrowProps) => (
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
