'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface EndowmentReadyGateProps {
  children: ReactNode;
}

/**
 * Hides the endowment landing page until styled-jsx CSS has been applied to
 * the DOM (specifically, until after the first paint frame following mount).
 *
 * In dev, Next.js/styled-jsx can inject component styles slightly after the
 * initial HTML is in the DOM, causing a brief FOUC where users see unstyled
 * content before the CSS lands. In production this is generally not visible
 * because the styles are inlined into the HTML stream.
 *
 * The gate adds at most ~16ms (one frame) of delay and is purely visual: the
 * content tree is mounted (so data fetching, effects, etc. all start
 * immediately). Only the opacity transitions from 0 to 1 once we know the
 * page is styled.
 */
export function EndowmentReadyGate({ children }: Readonly<EndowmentReadyGateProps>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Two rAFs guarantees we wait until after styled-jsx has flushed and the
    // browser has had a chance to lay out + paint the styled first frame.
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
