import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface CollapsibleItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  icon?: ReactNode;
}

export const CollapsibleItem = ({
  title,
  children,
  isOpen,
  onToggle,
  icon,
}: CollapsibleItemProps) => {
  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="text-gray-600 group-hover:text-gray-900 transition-colors">{icon}</div>
          )}
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            {title}
          </span>
        </div>
        <div className="text-gray-600 group-hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="pl-6 py-3 text-sm text-gray-600 border-l border-gray-100">{children}</div>
      )}
    </div>
  );
};

export const CollapsibleSection = ({
  title,
  icon,
  children,
  className,
}: CollapsibleSectionProps) => {
  return (
    <div className={`bg-white rounded-xl ${className || ''}`}>
      <div className="pt-6 pb-4">
        <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};
