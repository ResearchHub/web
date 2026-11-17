'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
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
 * The timeline's sideways scroller, at every width. The row runs edge to
 * edge and opens on the oldest work at the left, lined up under the
 * heading. Swipe on a phone (snapping to each moment), or scroll, drag
 * or use the arrow buttons on larger screens. Whichever edge has more to
 * see fades out.
 */
export function TimelineScroller({
  header,
  hint,
  children,
}: {
  header: ReactNode;
  hint: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
    };
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // Mouse drag, with a little momentum on release. Touch and trackpads
    // already scroll natively, so they are left alone.
    let drag: { x: number; left: number; moved: boolean } | null = null;
    let last = { x: 0, t: 0 };
    let v = 0;
    let glide = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(glide);
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
      last = { x: e.clientX, t: e.timeStamp };
      v = 0;
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        el.dataset.dragging = '';
      }
      e.preventDefault();
      el.scrollLeft = drag.left - dx;
      const dt = Math.max(1, e.timeStamp - last.t);
      v = 0.8 * ((e.clientX - last.x) / dt) + 0.2 * v;
      last = { x: e.clientX, t: e.timeStamp };
    };
    const up = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (!moved) return;
      // A drag is not a click on whatever it started over.
      const swallow = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      el.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
      let speed = prefersReducedMotion() ? 0 : v * 16;
      const step = () => {
        if (Math.abs(speed) < 0.5) {
          delete el.dataset.dragging;
          return;
        }
        el.scrollLeft -= speed;
        speed *= 0.93;
        glide = requestAnimationFrame(step);
      };
      step();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(glide);
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  // One card (and its gap) per press.
  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('li');
    const by = Math.max(card?.getBoundingClientRect().width ?? 0, el.clientWidth * 0.6);
    el.scrollBy({ left: dir * by, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const button =
    'flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--o-line-2)] text-[var(--o-soft)] transition-colors hover:bg-[rgb(var(--o-text-rgb)/0.07)] hover:text-[var(--o-text)] disabled:pointer-events-none disabled:opacity-30';

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1200px] items-end justify-between gap-6 px-5 tablet:px-10 content-lg:px-12">
        <div>
          {header}
          {(edges.left || edges.right) && hint}
        </div>
        {(edges.left || edges.right) && (
          <div className="hidden shrink-0 gap-2 tablet:flex">
            <button
              type="button"
              aria-label="Earlier"
              disabled={!edges.left}
              onClick={() => step(-1)}
              className={button}
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Later"
              disabled={!edges.right}
              onClick={() => step(1)}
              className={button}
            >
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={ref}
        role="region"
        aria-label="Timeline"
        tabIndex={0}
        data-fade-left={edges.left || undefined}
        data-fade-right={edges.right || undefined}
        className="o-scroll-x o-tl-row relative mt-10 snap-x snap-mandatory overflow-x-auto focus-visible:outline-none tablet:cursor-grab tablet:snap-none"
      >
        {children}
      </div>
    </>
  );
}
