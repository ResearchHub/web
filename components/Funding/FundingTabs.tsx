'use client';

import { FC, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { cn } from '@/utils/styles';
import { getShortTitle } from './GrantCarousel';

interface FundingTabsProps {
  selectedGrantId?: number | null;
  className?: string;
  rightContent?: React.ReactNode;
}

const DEMO_LABELS = [
  'Vascular Biology',
  'EMF & Radiation',
  'Gut Microbiome',
  'Neuroplasticity',
  'Gene Therapy',
  'Quantum Sensing',
  'Protein Folding',
  'Stem Cell Aging',
  'Epigenetics',
  'Dark Matter',
  'CRISPR Delivery',
  'Sleep Neuroscience',
  'Organoid Models',
  'Metabolomics',
  'Astrobiology',
  'Photosynthesis',
  'Immunotherapy',
  'Nanomedicine',
  'Regenerative Medicine',
  'Climate Modeling',
];

export function buildGrantTabs(grants: { content: FeedGrantContent }[]) {
  return grants.map((grant, i) => {
    const content = grant.content;
    return {
      id: `grant-${content.id}`,
      label: DEMO_LABELS[i % DEMO_LABELS.length],
      href: `/grant/${content.id}/${content.slug}`,
    };
  });
}

export const FundingTabs: FC<FundingTabsProps> = ({ selectedGrantId, className, rightContent }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { grants, isLoading, ensureLoaded } = useGrants();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const tabs = useMemo(() => {
    const grantTabs = buildGrantTabs(
      grants.map((g) => ({ content: g.content as FeedGrantContent }))
    );
    return [{ id: 'all', label: 'All', href: '/funding' }, ...grantTabs];
  }, [grants]);

  const activeTab = useMemo(() => {
    if (selectedGrantId) return `grant-${selectedGrantId}`;
    if (pathname === '/funding') return 'all';
    return 'all';
  }, [selectedGrantId, pathname]);

  const handleTabChange = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.href) router.push(tab.href);
  };

  return (
    <div className={cn('flex items-center', className)}>
      <Tabs
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
        disabled={isLoading}
        variant="pill"
        size="md"
      />
      {rightContent && <div className="ml-auto flex-shrink-0">{rightContent}</div>}
    </div>
  );
};
