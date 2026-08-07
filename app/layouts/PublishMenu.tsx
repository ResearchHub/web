'use client';

import { ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import Icon from '@/components/ui/icons/Icon';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import {
  OpenFundingOpportunityModal,
  type FundingOpportunityCreationMethod,
} from '@/components/Funding/OpenFundingOpportunityModal';
import {
  OpenProposalModal,
  type ProposalCreationMethod,
} from '@/components/Funding/OpenProposalModal';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useState } from 'react';
import { cn } from '@/utils/styles';

interface PublishMenuProps {
  forceMinimize?: boolean;
}

const PUBLISH_MENU_SECTIONS = [
  {
    title: 'Post on ResearchHub',
    items: [
      {
        id: 'give-funding',
        title: 'RFP',
        description: 'Fund research',
        icon: <Icon name="fund" size={18} color="#0d4ac4" />,
        handler: 'handleOpenGrant' as const,
        requiresAuth: true,
      },
      {
        id: 'request-funding',
        title: 'Proposal',
        description: 'Raise money for your research',
        icon: <FundingIcon size={18} color="#0d4ac4" />,
        handler: 'handleFundResearch' as const,
        requiresAuth: true,
      },
    ],
  },
] as const;

interface MenuItemContentProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MenuItemContent: React.FC<MenuItemContentProps> = ({ icon, title, description }) => {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 ring-1 ring-inset ring-black/5">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-500">{description}</div>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </div>
  );
};

export const PublishMenu: React.FC<PublishMenuProps> = ({ forceMinimize = false }) => {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { smAndDown } = useScreenSize();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isFundingOpportunityModalOpen, setIsFundingOpportunityModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const handleFundResearch = () => {
    setIsProposalModalOpen(true);
  };

  const handleConfirmCreateProposal = (method: ProposalCreationMethod) => {
    setIsProposalModalOpen(false);
    router.push(`/notebook?newFunding=true&proposalSource=${method}`);
  };

  const handleOpenGrant = () => {
    setIsFundingOpportunityModalOpen(true);
  };

  const handleConfirmOpenGrant = (method: FundingOpportunityCreationMethod) => {
    setIsFundingOpportunityModalOpen(false);
    router.push(`/notebook?newGrant=true&grantSource=${method}`);
  };

  const handleMenuItemClick = (item: (typeof PUBLISH_MENU_SECTIONS)[number]['items'][number]) => {
    if (item.requiresAuth) {
      executeAuthenticatedAction(() => {
        switch (item.handler) {
          case 'handleFundResearch':
            handleFundResearch();
            break;
          case 'handleOpenGrant':
            handleOpenGrant();
            break;
        }
      });
    }

    // Close mobile drawer after action
    if (smAndDown) {
      setIsMobileDrawerOpen(false);
    }
  };

  const isMenuOpen = smAndDown ? isMobileDrawerOpen : isDesktopMenuOpen;
  const trigger = (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2.5 rounded-lg bg-gray-100 px-5 py-3.5 text-[15px] font-medium text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
        forceMinimize
          ? 'justify-center !px-3'
          : 'tablet:max-sidebar-compact:justify-center tablet:max-sidebar-compact:!px-3'
      )}
      onClick={(e) => {
        if (smAndDown) {
          e.preventDefault();
          setIsMobileDrawerOpen(true);
        }
      }}
      aria-label="Open post menu"
    >
      <Plus
        className={cn(
          'h-[22px] w-[22px] stroke-[1.5] transition-transform duration-200',
          isMenuOpen && 'rotate-45'
        )}
      />
      <span className={cn(forceMinimize ? 'hidden' : 'tablet:max-sidebar-compact:hidden')}>
        Post
      </span>
    </button>
  );

  const menuContent = (
    <>
      <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        Create new
      </p>
      <div className="space-y-3 p-0.5">
        {PUBLISH_MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <div>
              {section.items.map((item) => (
                <BaseMenuItem
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="group w-full cursor-pointer rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50"
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
    </>
  );

  // Mobile drawer content
  const mobileDrawerContent = (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Create new</p>
      {PUBLISH_MENU_SECTIONS.map((section) => (
        <div key={section.title}>
          <div>
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
          {trigger}
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
        <BaseMenu
          trigger={trigger}
          align="start"
          sideOffset={8}
          className="w-[min(19rem,calc(100vw-3rem))] rounded-xl border-0 p-1 shadow-lg ring-1 ring-black/5"
          withOverlay={false}
          animate
          onOpenChange={setIsDesktopMenuOpen}
        >
          {menuContent}
        </BaseMenu>
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
