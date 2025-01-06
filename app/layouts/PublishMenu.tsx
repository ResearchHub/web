'use client'

import { Plus, FileUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClaimModal } from '@/components/modals/ClaimModal';
import { ClaimPaperIcon } from '@/components/ui/icons/ClaimPaperIcon';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { GrantIcon } from '@/components/ui/icons/GrantIcon';
import { BaseMenu, BaseMenuItem } from '@/components/menus/BaseMenu';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const router = useRouter();

  const handleItemClick = (action: string) => {
    switch (action) {
      case 'claim':
        setShowClaimModal(true);
        break;
      case 'submit-grant':
        router.push('/notebook/new?type=grant');
        break;
      case 'publish':
        router.push('/notebook/new');
        break;
      case 'request-funding':
        // TODO: Implement funding request flow
        break;
    }
  };

  const menuCategories = [
    {
      title: 'Your Research',
      items: [
        {
          icon: <FileUp strokeWidth={1.75} className="w-7 h-7" />,
          title: 'Submit new research',
          description: 'Submit your original research',
          action: 'publish'
        },
        {
          icon: <ClaimPaperIcon size={26} className="w-5 h-5" />,
          title: 'Claim paper',
          description: 'Earn ResearchCoin on your paper',
          action: 'claim'
        }
      ]
    },
    {
      title: 'Funding',
      items: [
        {
          icon: <FundingIcon size={28} className="w-5 h-5" color="rgb(79, 70, 229)" />,
          title: 'Request funding',
          description: 'Request funding on your research',
          action: 'request-funding'
        },
        {
          icon: <GrantIcon size={28} className="w-5 h-5" color="rgb(79, 70, 229)" />,
          title: 'Submit grant',
          description: 'Fund promising research by publishing an RFP',
          action: 'submit-grant'
        }
      ]
    }
  ];

  const trigger = (
    <button className="flex items-center gap-2 px-4 py-2 text-base font-medium text-white rounded-lg transition-all duration-200
        bg-indigo-600 hover:bg-indigo-500
        hover:shadow-[0_3px_10px_-3px_rgba(0,0,0,0.15),0_3px_4px_-3px_rgba(0,0,0,0.08)]">
      <Plus className="h-5 w-5 stroke-[1.5]" />
      <span>New</span>
      <ChevronDown className="h-4 w-4 stroke-[1.5] opacity-70" />
    </button>
  );

  return (
    <>
      <BaseMenu 
        trigger={trigger}
        align="start"
        withOverlay
        className="w-[280px] p-0"
        sideOffset={8}
      >
        <div className="py-2">
          {menuCategories.map((category, categoryIndex) => (
            <div key={category.title}>
              {categoryIndex > 0 && <div className="h-px bg-gray-100 mx-4 my-2" />}
              <div className="px-4 py-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {category.title}
                </h3>
              </div>
              {category.items.map((item) => (
                <BaseMenuItem
                  key={item.title}
                  className="w-full px-4 py-2.5"
                  onClick={() => handleItemClick(item.action)}
                >
                  <div className="flex items-center">
                    <div className="text-indigo-600">
                      {item.icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </BaseMenuItem>
              ))}
            </div>
          ))}
        </div>
      </BaseMenu>

      <ClaimModal 
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </>
  );
}; 