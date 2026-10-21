'use client';

import type { ComponentProps } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useIsMobileTopNavHidden } from '@/contexts/ScrollContainerContext';
import { cn } from '@/utils/styles';

type StickyTabsProps = Omit<ComponentProps<typeof Tabs>, 'variant'> & {
  /** Lets other parts of the page scroll the tabs into view. */
  id?: string;
};

/**
 * A page's tabs, stuck to the top of the main column as the page scrolls
 * under them: underlined from tablet up, and on phones a segmented switch on
 * a white band, edge to edge, with room above and below. On phones they
 * follow the top bar: right under it while it shows, at the very top once it
 * slides away.
 */
export function StickyTabs({ id, className, ...tabsProps }: StickyTabsProps) {
  const isTopBarHidden = useIsMobileTopNavHidden();

  return (
    <>
      {/* The tabs' own place on the page, which stuck tabs have left: scrolling
          here brings them back to where they started. On phones it clears
          the top bar, which the page scrolls under. */}
      <div
        id={id}
        aria-hidden="true"
        className="scroll-mt-[var(--top-bar-height)] tablet:!scroll-mt-0"
      />
      <div
        className={cn(
          'sticky z-20 bg-white transition-[top] duration-300',
          '-mx-4 px-4 py-2 tablet:!mx-0 tablet:!px-0 tablet:!py-0',
          // On phones the scrollport keeps the top bar's height as padding and
          // sticky offsets start inside it, so top-0 is right under the bar; as
          // the bar slides away the band moves up by its height. From tablet up
          // the page scrolls below the bar, which never hides.
          isTopBarHidden ? 'top-[calc(var(--top-bar-height)*-1)]' : 'top-0',
          'tablet:!top-0',
          className
        )}
      >
        <Tabs {...tabsProps} variant="segmented" className="tablet:!hidden" />
        <Tabs {...tabsProps} variant="primary" compact className="hidden tablet:!block" />
      </div>
    </>
  );
}
