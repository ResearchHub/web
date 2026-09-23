'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import {
  RadiatingDotTabIcon,
  RadiatingDotTabIconActive,
} from '@/components/ui/RadiatingDotTabIcon';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';

export type FundTab = 'activity' | 'fund' | 'proposals';

export const HOME_TAB_PATHS = ['/', '/fund', '/fund/proposals'];

export const isHomeTabPath = (pathname: string) => HOME_TAB_PATHS.includes(pathname);

const TAB_ACTIVE_CLASS_NAME = 'border-b-primary-600 text-primary-600 !border-b-4';

const TAB_ICON_CLASS_NAME = 'w-[18px] h-[18px]';

export const FUND_TABS = [
  {
    id: 'activity' as const,
    label: 'Activity',
    href: '/',
    icon: RadiatingDotTabIcon,
    activeIcon: RadiatingDotTabIconActive,
    iconClassName: TAB_ICON_CLASS_NAME,
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  // Money out and money in, in the arrows My Funding uses for the same two
  // sides: the circle stays grey and the arrow takes the tab's own colour.
  {
    id: 'fund' as const,
    label: (
      <span className="flex items-center gap-2">
        <FundingDirectionIcon direction="giving" colored={false} />
        RFPs
      </span>
    ),
    href: '/fund',
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  {
    id: 'proposals' as const,
    label: (
      <span className="flex items-center gap-2">
        <FundingDirectionIcon direction="receiving" colored={false} />
        Proposals
      </span>
    ),
    href: '/fund/proposals',
    activeClassName: TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
];

export function useFundTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useScrollContainer();

  const isFundPage = isHomeTabPath(pathname);

  const activeTab = useMemo((): FundTab => {
    if (pathname === '/fund/proposals') return 'proposals';
    if (pathname === '/fund') return 'fund';
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
