import type { LucideIcon } from 'lucide-react';

interface SidebarSectionProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'before' | 'after';
}

/**
 * A section in the sidebar with a title and optional action button
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
  children,
  action,
  icon: Icon,
  iconPosition = 'before',
}) => {
  return (
    <div className="flex items-center justify-between px-2 mb-1">
      <div className="flex items-center gap-2">
        {Icon && iconPosition === 'before' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase">
          {children}
        </span>
        {Icon && iconPosition === 'after' && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
};
