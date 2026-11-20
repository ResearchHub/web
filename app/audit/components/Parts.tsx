import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { sourceNumber, type SourceKey } from '../data/content';

/** The page's column. On wide screens its text clears the margin rule. */
export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1200px] px-5 tablet:pl-[72px] tablet:pr-10 content-lg:pl-[84px] content-lg:pr-12',
        className
      )}
    >
      {children}
    </div>
  );
}

/** A footnote mark: the source's number, linking to its entry under Sources. */
export function Ref({ to }: { to: SourceKey }) {
  const n = sourceNumber(to);
  return (
    <a href={`#source-${n}`} className="a-ref" aria-label={`Source ${n}`}>
      {n}
    </a>
  );
}

/** A section's headline. Its label is the section's own (see `Section`). */
export function SectionHead({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        'a-reveal a-serif mt-2 max-w-[15em] text-[clamp(32px,4vw,56px)] leading-[1.04]',
        className
      )}
    >
      {children}
    </h2>
  );
}

/**
 * A section between two rules. With `label`, the section opens with its
 * number (hanging on the margin rule) and its name in the mono, and that
 * line stays pinned to the top of the screen for as long as the section is
 * being read.
 */
export function Section({
  id,
  labelledBy,
  n,
  label,
  tone,
  children,
  className,
}: {
  id?: string;
  labelledBy: string;
  n?: number;
  label?: string;
  /** `blue` sets the section white on the blue pencil's colour. */
  tone?: 'blue';
  children: ReactNode;
  className?: string;
}) {
  const blue = tone === 'blue';
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'a-rule scroll-mt-10 border-t py-20 tablet:py-28',
        // `relative` lifts the section over the page's red margin rule.
        blue && 'a-tone-blue relative border-t-0 bg-[var(--a-blue)] text-white',
        className
      )}
    >
      <Wrap>
        {label && (
          <p
            className={cn(
              'a-mono sticky top-0 z-20 -mt-3 flex items-center gap-3 py-3 backdrop-blur-sm',
              blue
                ? 'bg-[rgb(var(--a-blue-rgb)/0.92)] text-[rgb(255_255_255/0.78)]'
                : 'bg-[rgb(var(--a-paper-rgb)/0.92)] text-[var(--a-mute)]'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] tracking-normal tablet:absolute tablet:left-[-46px] tablet:top-1/2 tablet:-translate-y-1/2 content-lg:left-[-50px]',
                blue
                  ? 'border-[color:rgb(255_255_255/0.7)] bg-[var(--a-blue)] text-white'
                  : 'border-[color:var(--a-red)] bg-[var(--a-paper)] text-[var(--a-red-deep)]'
              )}
            >
              {n}
            </span>
            {label}
          </p>
        )}
        {children}
      </Wrap>
    </section>
  );
}
