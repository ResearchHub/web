'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export type FundTab = 'grants' | 'proposals';

export const FUND_TABS = [
  {
    id: 'grants' as const,
    label: 'Funding Opportunities',
    href: '/fund',
    icon: ArrowDownCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-emerald-600 border-b-emerald-600',
  },
  {
    id: 'proposals' as const,
    label: 'Proposals',
    href: '/fund/proposals',
    icon: ArrowUpCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-primary-600 border-b-primary-600',
  },
];

export function useFundTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const isFundPage = pathname === '/fund' || pathname === '/fund/proposals';

  const activeTab = useMemo((): FundTab => {
    if (pathname === '/fund/proposals') return 'proposals';
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
