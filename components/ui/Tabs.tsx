import { cn } from "@/utils/styles";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  highlight?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className,
  variant = 'underline'
}) => {
  const getTabStyles = (tab: Tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    if (variant === 'pill') {
      return cn(
        'px-6 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2 flex-1 justify-center',
        isActive
          ? 'bg-indigo-100 text-indigo-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      );
    }

    return cn(
      'px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2',
      isActive
        ? 'text-indigo-600 border-indigo-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
    );
  };

  const wrapperStyles = cn(
    'flex items-center',
    variant === 'pill' && 'space-x-1 rounded-lg bg-gray-100 p-1',
    variant === 'underline' && 'space-x-6',
    className
  );

  return (
    <div className={wrapperStyles}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const TabButton = (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={getTabStyles(tab)}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );

        if (tab.separator) {
          return (
            <div key={tab.id} className="flex items-center space-x-6">
              <div className="h-6 w-px bg-gray-200" />
              {TabButton}
            </div>
          );
        }

        return TabButton;
      })}
    </div>
  );
}; 