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
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}) => {
  return (
    <div className={cn("flex items-center space-x-6", className)}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const TabButton = (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
            }`}
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