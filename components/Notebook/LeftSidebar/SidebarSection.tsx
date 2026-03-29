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
      <div className="flex items-center justify-between w-full px-2 py-1 group rounded">
        <Button
          variant="ghost"
          className="flex items-center gap-1.5 h-auto p-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {Icon && iconPosition === 'before' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
          <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase">
            {title}
          </span>
          {Icon && iconPosition === 'after' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        </Button>
        {action && <div className="flex items-center">{action}</div>}
      </div>
      {isExpanded && children && <div className="mt-1">{children}</div>}
    </div>
  );
};
