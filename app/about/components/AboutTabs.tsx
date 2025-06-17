'use client';

import { useRouter } from 'next/navigation';

interface AboutTabsProps {
  activeTab: string;
}

export const AboutTabs = ({ activeTab }: AboutTabsProps) => {
  const router = useRouter();

  const tabs = [
    {
      id: 'about',
      title: 'About',
      path: '/about',
    },
    {
      id: 'team',
      title: 'Team',
      path: '/team',
    },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-gray-100 rounded-full overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 text-base whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.path
                    ? 'bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
