'use client';

import { AlertCircle, Search as SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import toast from 'react-hot-toast';
import { PublishMenu } from './PublishMenu';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { FundingPowerRailButton } from '@/components/Funding/FundingPowerRailButton';
import { SidebarDocuments } from './components/SidebarDocuments';
import { SidebarHelpMenu } from './components/SidebarHelpMenu';

interface LeftSidebarProps {
  forceMinimize?: boolean;
  /**
   * Runs once something in it is picked: below 1240px the sidebar is a menu,
   * and a pick that changes the page in place must still close it.
   */
  onNavigate?: () => void;
  /** The menu's Search row, on a phone, where the top bar has no search. */
  onSearch?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  forceMinimize = false,
  onNavigate,
  onSearch,
}) => {
  const pathname = usePathname();

  const handleUnimplementedFeature = (featureName: string) => {
    toast(
      (t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ),
      {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED',
          color: '#EA580C',
          border: '1px solid #FDBA74',
        },
      }
    );
  };

  // Create minimized classes based on either responsive design or forced minimization
  const minimizeClass = forceMinimize ? 'minimized-sidebar' : '';

  return (
    <div className={`h-full flex flex-col z-50 bg-white overflow-hidden ${minimizeClass}`}>
      <div className={`p-4 pl-4 ${forceMinimize ? '!flex !justify-center' : ''} pt-[10px]`}>
        <Link href="/" onClick={onNavigate}>
          <div className={forceMinimize ? '!hidden' : 'ml-1'}>
            {/* The top of every page: loaded at once, not when the lazy loader gets to it. */}
            <Logo size={38} color="text-primary-600" loading="eager" />
          </div>
          <div className={forceMinimize ? '!block' : 'hidden'}>
            <Icon name="flaskFrame" size={38} color="#3971ff" />
          </div>
        </Link>
      </div>

      {onSearch && (
        <div className="mt-3 px-3 tablet:!hidden">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-10 w-full items-center gap-3 rounded-full bg-gray-100 px-4 text-left text-sm text-gray-500 transition-colors hover:bg-gray-200"
          >
            <SearchIcon className="h-4 w-4 shrink-0 text-gray-600" aria-hidden="true" />
            Search
          </button>
        </div>
      )}

      <div className={`mt-6 px-3 ${forceMinimize ? '!flex !justify-center !px-2' : ''}`}>
        <PublishMenu forceMinimize={forceMinimize} onItemSelected={onNavigate} />
      </div>

      {/* The nav and the user's documents scroll together, so a long list
          never squeezes the nav. A forced icon rail has no room for them. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Navigation
          currentPath={pathname || ''}
          onUnimplementedFeature={handleUnimplementedFeature}
          forceMinimize={forceMinimize}
          inScrollArea
          onNavigate={onNavigate}
        />
        <SidebarDocuments onNavigate={onNavigate} className={forceMinimize ? '!hidden' : ''} />
      </div>

      {/* The scroll area above is flex-1, so this sits at the bottom of the column.
          Only covers 768px to the right sidebar's breakpoint: above it the
          funding power card is in the right sidebar. */}
      <div className={`px-2 pb-3 ${forceMinimize ? '!block' : 'hidden tablet:max-lg:!block'}`}>
        <FundingPowerRailButton />
      </div>

      <div className={forceMinimize ? '!hidden' : ''}>
        <SidebarHelpMenu />
      </div>
    </div>
  );
};
