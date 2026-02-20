import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarSectionProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'before' | 'after';
  defaultExpanded?: boolean;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  action,
  icon: Icon,
  iconPosition = 'before',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-2">
      <Button
        variant="ghost"
        className="flex items-center justify-between w-full h-auto px-2 py-1 group cursor-pointer rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          {Icon && iconPosition === 'before' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
          <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase">
            {title}
          </span>
          {Icon && iconPosition === 'after' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        </div>
        {action && (
          <div className="flex items-center ml-2" onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}
      </Button>
      {isExpanded && children && <div className="mt-1 pl-2">{children}</div>}
    </div>
  );
};
