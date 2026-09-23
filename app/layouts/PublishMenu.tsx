'use client';

import { ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import {
  OpenFundingOpportunityModal,
  type FundingOpportunityCreationMethod,
} from '@/components/Funding/OpenFundingOpportunityModal';
import {
  OpenProposalModal,
  type ProposalCreationMethod,
} from '@/components/Funding/OpenProposalModal';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useState } from 'react';

interface PublishMenuProps {
  forceMinimize?: boolean;
}

interface PublishMenuItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  /** Which side of the money the item starts: an RFP funds, a proposal needs funding. */
  readonly intent: FundingIntent;
}

const PUBLISH_MENU_SECTIONS: readonly {
  readonly title: string;
  readonly items: readonly PublishMenuItem[];
}[] = [
  {
    title: 'Publish on ResearchHub',
    items: [
      // The two sides of the money, in the arrows My Funding uses for them.
      {
        id: 'give-funding',
        title: 'Request for Proposal',
        description: 'Fund specific research you care about',
        icon: (
          <FundingDirectionIcon
            direction="giving"
            className="h-9 w-9"
            iconClassName="h-[18px] w-[18px]"
          />
        ),
        intent: 'fund',
      },
      {
        id: 'request-funding',
        title: 'Proposal',
        description: 'Raise money for your research',
        icon: (
          <FundingDirectionIcon
            direction="receiving"
            className="h-9 w-9"
            iconClassName="h-[18px] w-[18px]"
          />
        ),
        intent: 'need_funding',
      },
    ],
  },
];

interface MenuItemContentProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MenuItemContent: React.FC<MenuItemContentProps> = ({ icon, title, description }) => {
  return (
    <div className="relative flex w-full items-center gap-3 pr-6">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold tracking-[0.01em] text-gray-900">{title}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
      <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-900 transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
    </div>
  );
};

/**
 * The sidebar's Publish button: a Request for Proposal or a Proposal. For a
 * user the workspace admits, either opens it straight onto a conversation
 * for that side of the money; everyone else gets the notebook's opening
 * modal and editor, as before.
 */
export const PublishMenu: React.FC<PublishMenuProps> = ({ forceMinimize = false }) => {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { inWorkspace, startNew } = useFundingDrafting();
  const { smAndDown } = useScreenSize();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isFundingOpportunityModalOpen, setIsFundingOpportunityModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const handleConfirmCreateProposal = (method: ProposalCreationMethod) => {
    setIsProposalModalOpen(false);
    router.push(`/notebook?newFunding=true&proposalSource=${method}`);
  };

  const handleConfirmOpenGrant = (method: FundingOpportunityCreationMethod) => {
    setIsFundingOpportunityModalOpen(false);
    router.push(`/notebook?newGrant=true&grantSource=${method}`);
  };

  const handleMenuItemClick = (item: PublishMenuItem) => {
    executeAuthenticatedAction(() => {
      if (inWorkspace) {
        startNew(item.intent);
      } else if (item.intent === 'fund') {
        setIsFundingOpportunityModalOpen(true);
      } else {
        setIsProposalModalOpen(true);
      }
    });

    // Close mobile drawer after action
    if (smAndDown) {
      setIsMobileDrawerOpen(false);
    }
  };

  // Regular trigger for standard mode
  const standardTrigger = (
    <button
      className={`flex items-center px-5 py-3.5 gap-2.5 text-[15px] font-medium rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (smAndDown) {
          setIsMobileDrawerOpen(true);
        }
      }}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
      <span>Publish</span>
    </button>
  );

  // Compact trigger for minimized sidebar
  const compactTrigger = (
    <button
      className={`${forceMinimize ? '' : 'hidden'} tablet:max-sidebar-compact:!flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-50 text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] mx-auto`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (smAndDown) {
          setIsMobileDrawerOpen(true);
        }
      }}
    >
      <Plus className="h-[22px] w-[22px] stroke-[1.5]" />
    </button>
  );

  const menuContent = (
    <div className="space-y-3">
      {PUBLISH_MENU_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="space-y-1">
            {section.items.map((item) => (
              <BaseMenuItem
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="group w-full cursor-pointer px-2 py-2 rounded-lg transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100"
              >
                <MenuItemContent
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </BaseMenuItem>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Mobile drawer content
  const mobileDrawerContent = (
    <div className="space-y-4">
      {PUBLISH_MENU_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  }
                }}
                className="group w-full px-3 py-3 cursor-pointer rounded-xl transition-colors duration-150 hover:bg-gray-100 active:bg-gray-100"
                role="button"
                tabIndex={0}
                aria-label={`${item.title}: ${item.description}`}
              >
                <MenuItemContent
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`relative ${forceMinimize ? 'flex justify-center' : ''}`}>
      {/* Mobile view with SwipeableDrawer */}
      {smAndDown && (
        <>
          <div
            onClick={() => setIsMobileDrawerOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMobileDrawerOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Open publish menu"
          >
            {standardTrigger}
            {compactTrigger}
          </div>
          <SwipeableDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            height="60vh"
            showCloseButton={false}
          >
            {mobileDrawerContent}
          </SwipeableDrawer>
        </>
      )}

      {/* Desktop view with BaseMenu */}
      {!smAndDown && (
        <>
          {/* Standard Menu */}
          <BaseMenu
            trigger={standardTrigger}
            align="start"
            sideOffset={8}
            className="w-[320px] p-1 rounded-xl"
            withOverlay={false}
            animate
          >
            {menuContent}
          </BaseMenu>

          {/* Compact Menu - same content, different trigger */}
          <BaseMenu
            trigger={compactTrigger}
            align="start"
            sideOffset={8}
            className="w-[320px] p-1 rounded-xl"
            withOverlay={false}
            animate
          >
            {menuContent}
          </BaseMenu>
        </>
      )}

      <OpenFundingOpportunityModal
        isOpen={isFundingOpportunityModalOpen}
        onClose={() => setIsFundingOpportunityModalOpen(false)}
        onConfirm={handleConfirmOpenGrant}
      />

      <OpenProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onConfirm={handleConfirmCreateProposal}
      />
    </div>
  );
};
