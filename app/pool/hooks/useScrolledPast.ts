'use client';

import { useEffect, useState } from 'react';

/**
 * True once the viewport has scrolled past the bottom of the matched element.
 *
 * Campaign top bars use this to fade themselves in and to reveal their own
 * "Fund" CTA only after the hero's has scrolled away, so there's one prominent
 * CTA at a time.
 */
export function useScrolledPast(selector: string): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    const update = () => setScrolled(window.scrollY >= el.offsetTop + el.offsetHeight);

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [selector]);

  return scrolled;
}
