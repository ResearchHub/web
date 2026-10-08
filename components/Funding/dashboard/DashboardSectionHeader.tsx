import type { ReactNode } from 'react';

interface DashboardSectionHeaderProps {
  readonly title: string;
  /** A small note after the title, e.g. how many items are active. */
  readonly meta?: ReactNode;
  /** The section's action, at the right: the button that starts a new one. */
  readonly action?: ReactNode;
}

/** The heading row of a My Funding section: the title, a note beside it, and the way to add to it. */
export function DashboardSectionHeader({ title, meta, action }: DashboardSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
        {meta && <span className="text-xs text-gray-500">{meta}</span>}
      </div>
      {action}
    </div>
  );
}
