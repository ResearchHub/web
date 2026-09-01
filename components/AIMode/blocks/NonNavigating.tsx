'use client';

import type { ReactNode } from 'react';

/**
 * Swallows clicks from production cards rendered inside the demo.
 *
 * The proposals in this run are representative rather than real, so their post
 * ids resolve to nothing. A card that looks live and then 404s is worse than one
 * that does not respond, and the alternative — pointer-events-none — would kill
 * the hover states the cards are worth showing for.
 *
 * Capture phase, so the handler runs before any anchor or button inside.
 */
export const NonNavigating = ({ children }: { readonly children: ReactNode }) => (
  <div
    onClickCapture={(event) => {
      event.preventDefault();
      event.stopPropagation();
    }}
  >
    {children}
  </div>
);
