'use client';

import { Plus, PenLine, UserCircle, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import Icon from '@/components/ui/icons/Icon';
import { useUser } from '@/contexts/UserContext';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface PublishMenuProps {
  children?: React.ReactNode;
  forceMinimize?: boolean;
}

export const PublishMenu: React.FC<PublishMenuProps> = ({ children, forceMinimize = false }) => {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();

  const handleFundResearch = () => {
    router.push('/notebook?newFunding=true');
  };

  const handleCreateBounty = () => {
    router.push('/bounty/create');
  };

  const handleCreateHub = () => {
    router.push('/hub/create');
  };

  const handleViewProfile = () => {
    navigateToAuthorProfile(user?.id, false);
  };

  // Regular trigger for standard mode
  const standardTrigger = (
    <button
      className={`flex items-center px-5 py-3.5 gap-2.5 text-[15px] font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
      <span>New</span>
    </button>
  );

  // Compact trigger for minimized sidebar
  const compactTrigger = (
    <button
      className={`${forceMinimize ? '' : 'hidden'} tablet:max-sidebar-compact:!flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] mx-auto`}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
    </button>
  );

  return (
    <div className="relative">
      {/* Standard Menu */}
      <BaseMenu
        trigger={standardTrigger}
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
                      Publish your research
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Preprint or peer reviewed publication
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(() => router.push('/notebook'))}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <PenLine size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Draft a Note
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Draft and publish your research
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
                      Apply for funding
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Preregister your work to get crowdfunded
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() =>
                  window.open(
                    'https://airtable.com/appZxEWpnNR2IEHpu/pagsytsewpnWbeLR0/form',
                    '_blank'
                  )
                }
                className="w-full px-2"
              >
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
                      Donate to fund a specific area of science
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(handleCreateBounty)}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="earn1" size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Create a bounty
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Incentivize researchers to problem solve
                    </div>
                  </div>
                </div>
              </BaseMenuItem>
            </div>
          </div>

          {/* ResearchHub Community section */}
          <div>
            <div className="px-3 mb-2 pt-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ResearchHub Community
              </h3>
            </div>
            <div className="space-y-2">
              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(handleCreateHub)}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Globe size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Create a hub
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Start a community around your research area
                    </div>
                  </div>
                </div>
              </BaseMenuItem>
            </div>
          </div>
        </div>
      </BaseMenu>

      {/* Compact Menu - same content, different trigger */}
      <BaseMenu
        trigger={compactTrigger}
        align="start"
        sideOffset={8}
        className="w-80 p-2"
        withOverlay={true}
        animate
      >
        {/* Same menu items */}
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
                      Publish your research
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Preprint or peer reviewed publication
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(() => router.push('/notebook'))}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <PenLine size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Draft a Note
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Draft and publish your research
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
                      Apply for funding
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Preregister your work to get crowdfunded
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() =>
                  window.open(
                    'https://airtable.com/appZxEWpnNR2IEHpu/pagsytsewpnWbeLR0/form',
                    '_blank'
                  )
                }
                className="w-full px-2"
              >
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
                      Donate to fund a specific area of science
                    </div>
                  </div>
                </div>
              </BaseMenuItem>

              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(handleCreateBounty)}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon name="earn1" size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Create a bounty
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Incentivize researchers to problem solve
                    </div>
                  </div>
                </div>
              </BaseMenuItem>
            </div>
          </div>

          {/* ResearchHub Community section */}
          <div>
            <div className="px-3 mb-2 pt-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                ResearchHub Community
              </h3>
            </div>
            <div className="space-y-2">
              <BaseMenuItem
                onClick={() => executeAuthenticatedAction(handleCreateHub)}
                className="w-full px-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Globe size={24} color="#2563eb" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium tracking-[0.02em] text-gray-900">
                      Create a hub
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Start a community around your research area
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
