import { FC } from 'react';
import { cn } from '@/utils/styles';

interface SidebarHeaderProps {
  title: string;
  className?: string;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ title, className }) => {
  return (
    <h3
      className={cn('text-md font-semibold text-gray-900 capitalize tracking-wide mb-2', className)}
    >
      {title}
    </h3>
  );
};
