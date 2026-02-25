import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface SidebarHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ title, action, className }) => {
  return (
    <div className={cn('flex items-center justify-between mb-2', className)}>
      <h3 className="text-md font-semibold text-gray-800 capitalize tracking-wide">{title}</h3>
      {action}
    </div>
  );
};
