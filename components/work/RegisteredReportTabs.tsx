'use client';

import { FileInput, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';

interface RegisteredReportTabsProps {
  reportId: number;
  slug: string;
  hasSourceProposal: boolean;
}

export function RegisteredReportTabs({
  reportId,
  slug,
  hasSourceProposal,
}: RegisteredReportTabsProps) {
  const pathname = usePathname();
  const reportHref = `/report/${reportId}/${slug}`;
  const activeTab = pathname.endsWith('/reviews') ? 'reviews' : 'report';

  const tabs = [
    {
      id: 'report',
      href: reportHref,
      label: (
        <div className="flex items-center">
          <FileInput className="h-4 w-4 mr-2" />
          <span>Report</span>
        </div>
      ),
    },
    ...(hasSourceProposal
      ? [
          {
            id: 'reviews',
            href: `${reportHref}/reviews`,
            label: (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                <span>Peer Reviews</span>
              </div>
            ),
          },
        ]
      : []),
  ];

  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={() => {}} className="border-b-0" />;
}
