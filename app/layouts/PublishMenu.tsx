'use client';

import { Plus, FileUp, BadgeCheck, HandCoins, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';
import { useState } from 'react';

interface PublishMenuProps {
  children?: React.ReactNode;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children }) => {
  const router = useRouter();
  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);

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
              <BaseMenuItem onClick={() => router.push('/paper/new')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileUp className="h-6 w-6 text-blue-600" />
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

              <BaseMenuItem onClick={() => router.push('/paper/claim')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BadgeCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Claim paper
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Claim ownership of your paper and earn ResearchCoin when it is cited.
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
              <BaseMenuItem onClick={() => setIsBountyModalOpen(true)} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Create a bounty
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Engage the world's brightest minds by offering ResearchCoin
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem onClick={() => router.push('/fund/create')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FundingIcon size={24} className="text-blue-600" color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Fund your research
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Fund your research through a crowdfunding campaign.
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem onClick={() => router.push('/grant/create')} className="w-full px-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <HandCoins className="h-6 w-6 text-blue-600" />
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

      <CreateBountyModal isOpen={isBountyModalOpen} onClose={() => setIsBountyModalOpen(false)} />
    </div>
  );
};
