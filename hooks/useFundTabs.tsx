'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Waves, type LucideIcon, type LucideProps } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';

/** Sized via PillTabs' className to match Lucide stroke icons in the pills. */
function BullhornIcon({ className }: LucideProps) {
  return <FontAwesomeIcon icon={faBullhorn} className={className} />;
}

export type FundTab = 'activity' | 'fund' | 'proposals';

/** Routes that make up the homepage hub — all of them highlight "Home" in the nav. */
export const HOME_TAB_PATHS = ['/', '/fund', '/fund/proposals'];

export const isHomeTabPath = (pathname: string) => HOME_TAB_PATHS.includes(pathname);

const HOME_TAB_ACTIVE_CLASS_NAME = 'border-b-primary-600 text-primary-600 !border-b-4';

export const FUND_TABS = [
  {
    id: 'activity' as const,
    label: 'Activity',
    href: '/',
    icon: Waves,
    activeClassName: HOME_TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  {
    id: 'fund' as const,
    label: 'Request for Proposals',
    href: '/fund',
    icon: BullhornIcon as LucideIcon,
    activeClassName: HOME_TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
  {
    id: 'proposals' as const,
    label: 'Proposals',
    href: '/fund/proposals',
    icon: FileText,
    activeClassName: HOME_TAB_ACTIVE_CLASS_NAME,
    scroll: false,
  },
];

/** Homepage hub: Activity / Request for Proposals / Proposals (shared shell + FundSidebar). */
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
