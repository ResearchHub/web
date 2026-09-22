import type { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

/**
 * A list on My Funding with nothing in it yet. Just the fact, no button: the
 * way to start something is the composer at the top of the page.
 */
export const DashboardEmptyState: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500',
      className
    )}
  >
    {children}
  </div>
);
