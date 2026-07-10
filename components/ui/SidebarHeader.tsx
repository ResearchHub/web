import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface SidebarHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ title, action, className }) => {
  return (
    <div className={cn('flex items-center justify-between gap-2 mb-2', className)}>
      <h3 className="flex-1 min-w-0 text-md font-semibold text-gray-800 capitalize tracking-wide truncate">
        {title}
      </h3>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
};
