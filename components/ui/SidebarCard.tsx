import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface SidebarCardProps {
  title: ReactNode;
  /** Beside the title, at the card's right edge (a badge, a help button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** One titled card in a page's right sidebar, e.g. recent activity or the reviews. */
export function SidebarCard({ title, action, children, className }: SidebarCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-gray-200 bg-white px-4 pb-3 pt-3.5 shadow-sm',
        className
      )}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-gray-900">
          {title}
        </h2>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/** A sidebar card's place while it loads: a title over a few rows, each led by a face. */
export function SidebarCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 rounded-lg border border-gray-200 p-4">
      <div className="h-4 w-24 rounded bg-gray-200" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200" />
          <div className="h-4 flex-1 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
