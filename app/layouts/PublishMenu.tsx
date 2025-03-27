'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import Icon from '@/components/ui/icons/Icon';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleFundResearch = () => {
    router.push('/notebook?newFunding=true');
  };

  const handleCreateBounty = () => {
    router.push('/bounty/create');
  };

  const trigger = (
    <button className="flex items-center px-5 py-3.5 gap-2.5 text-[15px] font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px]">
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
      <span>New</span>
    </button>
  );

  return (
    <div className="relative">
      <BaseMenu
        trigger={trigger}
        align="start"
        sideOffset={8}
        className="w-80 p-2"
        withOverlay={true}
        animate
      >
        {/* Menu items */}
        <div className="space-y-4 pt-2">
          {/* Your Research section */}
          <div>
            <div className="px-3 mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Research
              </h3>
            </div>
            <div className="space-y-2">
              <BaseMenuItem onClick={() => router.push('/paper/create')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="submit1" size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Submit your research
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Submit your original research. Optionally publish in the ResearchHub Journal.
                    </div>
                  </div>
                </div>
              </BaseMenuItem>
            </div>
          </div>

          {/* ResearchCoin Economy section */}
          <div>
            <div className="px-3 mb-2 pt-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ResearchCoin Economy
              </h3>
            </div>
            <div className="space-y-2">
              <BaseMenuItem onClick={handleCreateBounty} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="earn1" size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Open a scientific bounty
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Engage the world's brightest minds by offering ResearchCoin
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(handleFundResearch)}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FundingIcon size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Crowdfund your research
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Get your research funded through a crowdfunding campaign.
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem onClick={() => router.push('/grant/create')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="fund" size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Open a grant
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Fund promising research on ResearchHub.
                    </div>
                  </div>
                </div>
              </BaseMenuItem>
            </div>
          </div>
        </div>
      </BaseMenu>
    </div>
  );
};
