'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface GiveReadyGateProps {
  children: ReactNode;
}

/**
 * Hides the give landing page until styled-jsx CSS has been applied to the DOM
 * (specifically, until after the first paint frame following mount).
 *
 * In dev, Next.js/styled-jsx can inject component styles slightly after the
 * initial HTML is in the DOM, causing a brief FOUC where users see unstyled
 * content before the CSS lands. In production this is generally not visible
 * because the styles are inlined into the HTML stream.
 *
 * The gate adds at most ~16ms (one frame) of delay and is purely visual: the
 * content tree is mounted (so data fetching, effects, etc. all start
 * immediately). Only the opacity transitions from 0 to 1 once we know the page
 * is styled.
 */
export function GiveReadyGate({ children }: Readonly<GiveReadyGateProps>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}
