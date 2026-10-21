import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

/**
 * A page's main actions, stuck to the bottom of the main column wherever the
 * right sidebar, and the card that carries them there, is hidden.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    // On a phone it reaches the screen's bottom edge, so it pads itself clear
    // of the home indicator.
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-2 border-t border-gray-200 bg-white px-4 pt-3',
        'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
        'tablet:!-mx-8 tablet:!px-8 tablet:!pb-3 lg:!hidden'
      )}
    >
      {children}
    </div>
  );
}
