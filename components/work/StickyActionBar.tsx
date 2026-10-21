import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

/**
 * A page's main actions, stuck to the bottom of the main column wherever the
 * right sidebar, and the card that carries them there, is hidden.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    // Sticky bottom-0 lands just above the scrollport's padding, which on
    // phones is the room kept for the bottom nav. A white strip fills that room
    // under the nav, so no page text shows through when the nav fades on scroll.
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3',
        'after:absolute after:inset-x-0 after:top-full after:h-[calc(4rem+env(safe-area-inset-bottom,0px))] after:bg-white',
        'tablet:!-mx-8 tablet:!px-8 tablet:after:!hidden lg:!hidden'
      )}
    >
      {children}
    </div>
  );
}
