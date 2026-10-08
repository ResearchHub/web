import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface DashboardSectionHeaderProps {
  readonly title: string;
  /** A small note after the title, e.g. how many items are active. */
  readonly meta?: ReactNode;
  /** The section's action, at the right: the button that starts a new one. */
  readonly action?: ReactNode;
}

/** The heading row of a My Funding section: the title, a note beside it, and the way to add to it. */
export function DashboardSectionHeader({ title, meta, action }: DashboardSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
        {meta && <span className="text-xs text-gray-500">{meta}</span>}
      </div>
      {action}
    </div>
  );
}

type SeeAllButtonProps = {
  readonly children: ReactNode;
  /** `sm` for the rail's smaller headings. */
  readonly size?: 'sm' | 'md';
} & (
  | { readonly onClick: () => void; readonly href?: never }
  | { readonly href: string; readonly onClick?: never }
);

/**
 * The quiet way to the rest of a list: grey text and an arrow that leans
 * forward on hover, so it sits beside a section title without competing with it.
 */
export function SeeAllButton({ children, size = 'md', ...target }: SeeAllButtonProps) {
  const className = cn(
    'group/see-all inline-flex items-center gap-1 font-medium text-gray-500 transition-colors hover:text-gray-900',
    size === 'md' ? 'text-[13px]' : 'text-xs'
  );
  const content = (
    <>
      {children}
      <ArrowRight
        className={cn(
          'transition-transform group-hover/see-all:translate-x-0.5',
          size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'
        )}
        aria-hidden="true"
      />
    </>
  );

  return target.href != null ? (
    <Link href={target.href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={target.onClick} className={className}>
      {content}
    </button>
  );
}
