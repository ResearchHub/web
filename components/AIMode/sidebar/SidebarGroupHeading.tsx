import type { ReactNode } from 'react';

interface SidebarGroupHeadingProps {
  readonly children: ReactNode;
  /** A small control at the heading's right end. */
  readonly action?: ReactNode;
}

/** A quiet label over a group of sidebar rows. */
export function SidebarGroupHeading({ children, action }: SidebarGroupHeadingProps) {
  return (
    <div className="flex items-center justify-between px-3 pb-1.5 pt-3.5">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.07em] text-gray-500">
        {children}
      </h2>
      {action}
    </div>
  );
}
