'use client';

import type { ComponentProps } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { WORK_BOX_WIDTH_CLASS, WORK_ROW_CLASS } from '@/components/work/WorkCover';
import { useIsMobileTopNavHidden } from '@/contexts/ScrollContainerContext';
import { cn } from '@/utils/styles';

type WorkPageTabsProps = Omit<ComponentProps<typeof Tabs>, 'variant'> & {
  /** Lets other parts of the page scroll the tabs into view. */
  id?: string;
};

/**
 * A work page's sections, right under its cover and as wide as it, across the
 * main column and the sidebar. They stick to the top as the page scrolls: on
 * phones right under the top bar while it shows, and at the very top once it
 * slides away. Render them in PageLayout's `pageTabs`, which spans the page.
 */
export function WorkPageTabs({ id, className, ...tabsProps }: WorkPageTabsProps) {
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
          // On phones the scrollport keeps the top bar's height as padding and
          // sticky offsets start inside it, so top-0 is right under the bar; as
          // the bar slides away the tabs move up by its height. From tablet up
          // the page scrolls below the bar, which never hides.
          isTopBarHidden ? 'top-[calc(var(--top-bar-height)*-1)]' : 'top-0',
          'tablet:!top-0',
          className
        )}
      >
        <div className={WORK_ROW_CLASS}>
          <Tabs {...tabsProps} variant="page" className={WORK_BOX_WIDTH_CLASS} />
        </div>
      </div>
    </>
  );
}
