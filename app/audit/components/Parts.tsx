import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

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

/** A footnote mark linking to its entry under Sources. */
export function Ref({ n }: { n: number }) {
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
  /** `dark` sets the section white on black. */
  tone?: 'dark';
  children: ReactNode;
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'a-rule scroll-mt-10 border-t py-20 tablet:py-28',
        dark && 'border-t-0 bg-[var(--a-ink)] text-[var(--a-sheet)]',
        className
      )}
    >
      <Wrap>
        {label && (
          <p
            className={cn(
              'a-mono sticky top-0 z-20 -mt-3 flex items-center gap-3 py-3 backdrop-blur-sm',
              dark
                ? 'bg-[rgb(var(--a-ink-rgb)/0.92)] text-[rgb(253_252_248/0.65)]'
                : 'bg-[rgb(var(--a-paper-rgb)/0.92)] text-[var(--a-mute)]'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--a-red)] text-[11px] tracking-normal tablet:absolute tablet:left-[-46px] tablet:top-1/2 tablet:-translate-y-1/2 content-lg:left-[-50px]',
                dark
                  ? 'bg-[var(--a-ink)] text-[#ff8a73]'
                  : 'bg-[var(--a-paper)] text-[var(--a-red-deep)]'
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
