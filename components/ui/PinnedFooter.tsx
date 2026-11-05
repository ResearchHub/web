import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

/**
 * Where the footer is pinned, which sets how far it reaches out past the
 * container's padding to sit flush with its edges: SwipeableDrawer pads its
 * content by 16px, and the side panels pad theirs by 24px.
 */
export type PinnedFooterContainer = 'drawer' | 'panel';

const EDGE_TO_EDGE: Record<PinnedFooterContainer, string> = {
  drawer: '-mx-4 -mb-4 px-4 pb-4',
  panel: '-mx-6 -mb-6 px-6 pb-6',
};

/**
 * A drawer's or side panel's actions, stuck to its bottom edge while the rest
 * scrolls. It sits last in a full-height flex column and pushes itself down.
 */
export function PinnedFooter({
  container,
  className,
  children,
}: {
  container: PinnedFooterContainer;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 mt-auto border-t border-gray-100 bg-white pt-4',
        EDGE_TO_EDGE[container],
        className
      )}
    >
      {children}
    </div>
  );
}
