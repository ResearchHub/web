'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ReferralReadyGateProps {
  children: ReactNode;
}

/**
 * Hides the referral landing page until styled-jsx CSS has been applied to the
 * DOM (after the first paint frame following mount), preventing a brief FOUC in
 * dev where unstyled content can flash before component styles land. The content
 * tree mounts immediately (so data fetching/effects start right away); only the
 * opacity transitions from 0 to 1 once the page is styled.
 */
export function ReferralReadyGate({ children }: Readonly<ReferralReadyGateProps>) {
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
