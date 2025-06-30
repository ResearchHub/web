'use client';

import { Plus, PenLine, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import Icon from '@/components/ui/icons/Icon';
import { useUser } from '@/contexts/UserContext';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useState } from 'react';

interface PublishMenuProps {
  children?: React.ReactNode;
  forceMinimize?: boolean;
}

const PUBLISH_MENU_SECTIONS = [
  {
    title: 'Your Research',
    items: [
      {
        id: 'submit-paper',
        title: 'Submit your paper',
        description: 'Preprint or peer reviewed publication',
        icon: <Icon name="submit1" size={24} color="#2563eb" />,
        action: 'navigate',
        path: '/paper/create',
        requiresAuth: true,
      },
      {
        id: 'write-note',
        title: 'Write a research note',
        description: 'Share insights, ideas, or work in progress',
        icon: <PenLine size={24} color="#2563eb" />,
        action: 'navigate',
        path: '/notebook',
        requiresAuth: true,
      },
    ],
  },
  {
    title: 'ResearchCoin Economy',
    items: [
      {
        id: 'request-funding',
        title: 'Request funding',
        description: 'Get crowdfunding for your experiments',
        icon: <FundingIcon size={24} color="#2563eb" />,
        action: 'function',
        handler: 'handleFundResearch',
        requiresAuth: true,
      },
      {
        id: 'give-funding',
        title: 'Give research funding',
        description: 'Fund specific research you care about',
        icon: <Icon name="fund" size={24} color="#2563eb" />,
        action: 'function',
        handler: 'handleOpenGrant',
        requiresAuth: true,
      },
      {
        id: 'post-bounty',
        title: 'Post a bounty',
        description: 'Pay experts to solve your problems',
        icon: <Icon name="earn1" size={24} color="#2563eb" />,
        action: 'function',
        handler: 'handleCreateBounty',
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
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium tracking-[0.02em] text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5">{description}</div>
      </div>
    </div>
  );
};

export const PublishMenu: React.FC<PublishMenuProps> = ({ children, forceMinimize = false }) => {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { user } = useUser();
  const { smAndDown } = useScreenSize();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleFundResearch = () => {
    router.push('/notebook?newFunding=true');
  };

  const handleOpenGrant = () => {
    router.push('/notebook?newGrant=true');
  };

  const handleCreateBounty = () => {
    router.push('/bounty/create');
  };

  const handleViewProfile = () => {
    navigateToAuthorProfile(user?.id, false);
  };

  const handleMenuItemClick = (item: (typeof PUBLISH_MENU_SECTIONS)[number]['items'][number]) => {
    if (item.requiresAuth) {
      executeAuthenticatedAction(() => {
        if (item.action === 'navigate') {
          router.push(item.path);
        } else if (item.action === 'function') {
          switch (item.handler) {
            case 'handleFundResearch':
              handleFundResearch();
              break;
            case 'handleOpenGrant':
              handleOpenGrant();
              break;
            case 'handleCreateBounty':
              handleCreateBounty();
              break;
          }
        }
      });
    } else if (item.action === 'navigate') {
      router.push(item.path);
    }

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
      <span>New</span>
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
    <div className="space-y-4 pt-2">
      {PUBLISH_MENU_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <BaseMenuItem
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="w-full px-2"
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
          <div className="px-3 mb-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
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
                className="w-full px-3 py-3 hover:bg-gray-50 cursor-pointer rounded-lg"
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
            showCloseButton={true}
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
            className="w-80 p-2"
            withOverlay={true}
            animate
          >
            {menuContent}
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
            {menuContent}
          </BaseMenu>
        </>
      )}
    </div>
  );
};
