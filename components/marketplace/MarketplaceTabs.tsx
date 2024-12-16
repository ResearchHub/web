'use client'

interface MarketplaceTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MarketplaceTabs: React.FC<MarketplaceTabsProps> = ({ activeTab, setActiveTab }) => (
  <div className="w-full border-b">
    <div className="flex space-x-8">
      <button 
        onClick={() => setActiveTab('fund')}
        className={`px-1 py-4 text-sm font-medium relative ${
          activeTab === 'fund' 
            ? 'text-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Fund
        {activeTab === 'fund' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
        )}
      </button>
      <button 
        onClick={() => setActiveTab('rewards')}
        className={`px-1 py-4 text-sm font-medium relative ${
          activeTab === 'rewards' 
            ? 'text-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Rewards
        {activeTab === 'rewards' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
        )}
      </button>
      <button 
        onClick={() => setActiveTab('grants')}
        className={`px-1 py-4 text-sm font-medium relative ${
          activeTab === 'grants' 
            ? 'text-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Grants
        {activeTab === 'grants' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
        )}
      </button>
    </div>
  </div>
); 