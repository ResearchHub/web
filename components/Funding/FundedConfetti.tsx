'use client';

import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/** How long after the card shows the burst waits, so it lands once the page has settled. */
const DELAY_MS = 1000;

/**
 * A burst of confetti over a fully funded proposal's funding surface, a
 * second after it first shows, as the share window celebrates a post. It
 * fills its nearest positioned parent and is clipped to it, so the parent
 * needs `relative` (or sticky). It plays once per mount, and not at all where
 * the parent is hidden at this width (the sidebar's card on phones, the
 * action bar on desktop), when `skip` is set, or for readers who ask for less
 * motion.
 */
export function FundedConfetti({ skip = false }: { skip?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  // Unknown until hydrated; the burst waits for the answer.
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (skip || prefersReducedMotion !== false || hasPlayed.current) return;
    const timeout = setTimeout(() => {
      const box = boxRef.current;
      hasPlayed.current = true;
      // A box with no width is hidden at this screen size.
      if (!box || box.offsetWidth === 0) return;
      setSize({ width: box.offsetWidth, height: box.offsetHeight });
    }, DELAY_MS);
    return () => clearTimeout(timeout);
  }, [skip, prefersReducedMotion]);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {size && (
        <Confetti
          width={size.width}
          height={size.height}
          gravity={0.2}
          recycle={false}
          numberOfPieces={100}
          colors={['#f97316', '#3971ff', '#34d399']}
          onConfettiComplete={() => setSize(null)}
        />
      )}
    </div>
  );
}
