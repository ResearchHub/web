'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Waves, type LucideIcon, type LucideProps } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';

/** Sized via Tabs' className to match Lucide stroke icons in the pills. */
function BullhornIcon({ className }: LucideProps) {
  return <FontAwesomeIcon icon={faBullhorn} className={className} />;
}

export type FundTab = 'grants' | 'proposals' | 'activity';

export const FUND_TABS = [
  {
    id: 'activity' as const,
    label: 'Activity',
    href: '/fund/activity',
    icon: Waves,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-indigo-600 border-b-indigo-600',
  },
  {
    id: 'grants' as const,
    label: 'Request for Proposals',
    href: '/fund',
    icon: BullhornIcon as LucideIcon,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-emerald-600 border-b-emerald-600',
  },
  {
    id: 'proposals' as const,
    label: 'Proposals',
    href: '/fund/proposals',
    icon: FileText,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-primary-600 border-b-primary-600',
  },
];

export function useFundTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const isFundPage =
    pathname === '/fund' || pathname === '/fund/proposals' || pathname === '/fund/activity';

  const activeTab = useMemo((): FundTab => {
    if (pathname === '/fund/proposals') return 'proposals';
    if (pathname === '/fund/activity') return 'activity';
    return 'grants';
  }, [pathname]);

  const tabs = useMemo(() => FUND_TABS, []);

  const handleTabChange = (tab: string, e?: React.MouseEvent) => {
    if (tab === activeTab) {
      e?.preventDefault();
      return;
    }

    const href = FUND_TABS.find((t) => t.id === tab)?.href;
    if (!href) return;

    if (e && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      router.push(href);
    } else if (!e) {
      router.push(href);
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
