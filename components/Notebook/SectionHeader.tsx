import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  /** Lets a `<section aria-labelledby>` point at the heading. */
  id?: string;
  /** Sits at the far end of the row: a count's companion button, a re-scan. */
  action?: ReactNode;
  children: ReactNode;
}

export function SectionHeader({ icon: Icon, id, action, children }: Readonly<SectionHeaderProps>) {
  return (
    <div className="mb-2">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-700" />}
        <h3 id={id} className="text-[15px] font-semibold tracking-tight text-gray-900">
          {children}
        </h3>
        {action && <div className="ml-auto flex shrink-0 items-center gap-1">{action}</div>}
      </div>
    </div>
  );
}
