'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

function prefersReducedMotion() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(window.location.search).get('orch-motion') === 'reduce'
  );
}

/**
 * Plays a one-shot CSS sequence when its box scrolls into view. The server
 * renders the finished state (no `data-seq`), so without JavaScript or with
 * reduced motion the content is simply there. On mount the box is "armed"
 * (children drop to their start state via CSS) and, once 30% of it is on
 * screen, set to "run". The steps and timings live in orch.css.
 */
export function Sequence({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    el.dataset.seq = 'armed';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // One frame in the armed state first, so the run always animates.
        requestAnimationFrame(() => {
          el.dataset.seq = 'run';
        });
        io.disconnect();
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * The timeline's sideways scroller. Where the row is wider than the screen
 * (below 1240px) it opens at the right-hand end, on the newest work, and
 * fades whichever edge has more to see.
 */
export function TimelineScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
    };
    if (el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-fade-left={edges.left || undefined}
      data-fade-right={edges.right || undefined}
      className="o-scroll-x relative snap-x snap-mandatory scroll-px-5 overflow-x-auto tablet:scroll-px-0"
    >
      {children}
    </div>
  );
}
