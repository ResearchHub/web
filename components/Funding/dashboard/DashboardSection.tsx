import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DISPLAY_FONT } from '@/components/Funding/dashboard/MyFundingHero';
import { cn } from '@/utils/styles';

interface DashboardSectionProps {
  readonly title: string;
  /** The section's action, at the right of its heading. */
  readonly action?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * A My Funding section, its title in the hero's display face so every heading
 * stands apart from the content under it.
 */
export function DashboardSection({ title, action, className, children }: DashboardSectionProps) {
  return (
    <section aria-label={title} className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <h2
          className="min-w-0 text-[26px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#0b1530]"
          style={DISPLAY_FONT}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
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
