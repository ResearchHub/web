import { cn } from "@/utils/styles";

interface Tab {
  id: string;
  label: string;
  highlight?: boolean;
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
    <div className={cn("flex space-x-6", className)}>
      {tabs.map((tab) => {
        if (tab.highlight) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-3 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 border-b-2 transition-colors duration-200 flex items-center gap-2 bg-indigo-50 rounded-t-lg border-indigo-600"
            >
              {tab.label}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}; 