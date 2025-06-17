'use client';

import { AlertCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import toast from 'react-hot-toast';
import { PublishMenu } from './PublishMenu';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { Switch } from '@/components/ui/Switch';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface LeftSidebarProps {
  forceMinimize?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ forceMinimize = false }) => {
  const pathname = usePathname();
  const { showUSD, toggleCurrency } = useCurrencyPreference();

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
      <div
        className={`p-4 pl-4 ${forceMinimize ? '!flex !justify-center' : 'tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center'}`}
      >
        <Link href="/">
          <div className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden ml-1'}>
            <Logo size={38} color="text-primary-600" />
          </div>
          <div className={forceMinimize ? '!block' : 'hidden tablet:max-sidebar-compact:!block'}>
            <Icon name="flaskFrame" size={38} color="#3971ff" />
          </div>
        </Link>
      </div>

      <div className={`px-4 mt-6 ${forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'}`}>
        <PublishMenu forceMinimize={forceMinimize} />
      </div>

      <div className="flex-1 mt-2 overflow-y-auto">
        <div
          className={`px-4 py-4 ${forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'}`}
        >
          <Navigation
            currentPath={pathname || ''}
            onUnimplementedFeature={handleUnimplementedFeature}
            forceMinimize={forceMinimize}
          />
        </div>
      </div>

      {/* Currency Toggle */}
      <div
        className={`px-4 py-3 border-t border-gray-200 ${forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'}`}
      >
        <div
          className={`flex items-center ${forceMinimize ? 'justify-center' : 'tablet:max-sidebar-compact:justify-center justify-between'}`}
        >
          <div className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}>
            <div className="text-xs font-medium text-gray-900">Currency</div>
            <div className="text-xs text-gray-500">Display format</div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${!showUSD ? 'text-gray-900' : 'text-gray-500'}`}>
              RSC
            </span>
            <Switch checked={showUSD} onCheckedChange={toggleCurrency} variant="currency" />
            <span className={`text-xs font-medium ${showUSD ? 'text-gray-900' : 'text-gray-500'}`}>
              USD
            </span>
          </div>
        </div>
      </div>

      <div className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}>
        <FooterLinks />
      </div>
    </div>
  );
};
