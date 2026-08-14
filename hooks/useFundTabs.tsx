'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { type LucideIcon, type LucideProps } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBullhorn, faFileSignature } from '@fortawesome/pro-light-svg-icons';
import { RadiatingDotTabIcon } from '@/components/ui/RadiatingDotTabIcon';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';

function faTabIcon(icon: IconDefinition) {
  return function FaTabIcon({ className }: LucideProps) {
    return <FontAwesomeIcon icon={icon} className={className} />;
  } as LucideIcon;
}

export type FundTab = 'activity' | 'fund' | 'proposals';

export const FEED_V2_TAB_PATHS = ['/feed-v2', '/feed-v2/fund', '/feed-v2/fund/proposals'];

export const isFeedV2TabPath = (pathname: string) => FEED_V2_TAB_PATHS.includes(pathname);

const TAB_ACTIVE_CLASS_NAME = 'border-b-primary-600 text-primary-600 !border-b-4';

const TAB_ICON_CLASS_NAME = 'w-[18px] h-[18px]';

export const FUND_TABS = [
  {
    id: 'activity' as const,
    label: 'Activity',
    href: '/feed-v2',
    icon: RadiatingDotTabIcon,
    iconClassName: TAB_ICON_CLASS_NAME,
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  {
    id: 'fund' as const,
    label: (
      <>
        <span className="tablet:hidden">RFPs</span>
        <span className="hidden tablet:inline">Request for Proposals</span>
      </>
    ),
    href: '/feed-v2/fund',
    icon: faTabIcon(faBullhorn),
    iconClassName: TAB_ICON_CLASS_NAME,
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  {
    id: 'proposals' as const,
    label: 'Proposals',
    href: '/feed-v2/fund/proposals',
    icon: faTabIcon(faFileSignature),
    iconClassName: TAB_ICON_CLASS_NAME,
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
];

export function useFundTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useScrollContainer();

  const isFundPage = isFeedV2TabPath(pathname);

  const activeTab = useMemo((): FundTab => {
    if (pathname === '/feed-v2/fund/proposals') return 'proposals';
    if (pathname === '/feed-v2/fund') return 'fund';
    return 'activity';
  }, [pathname]);

  const tabs = useMemo(() => FUND_TABS, []);

  const scrollToTop = () => {
    const container = scrollContainerRef?.current;
    if (container) {
      container.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleTabChange = (tab: string, e?: React.MouseEvent) => {
    if (tab === activeTab) {
      e?.preventDefault();
      return;
    }

    const href = FUND_TABS.find((t) => t.id === tab)?.href;
    if (!href) return;

    if (e && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      scrollToTop();
      router.push(href, { scroll: false });
    } else if (!e) {
      scrollToTop();
      router.push(href, { scroll: false });
    }
  };

  return {
    tabs,
    activeTab,
    highlightedTab: activeTab,
    handleTabChange,
    isFundPage,
  };
}
