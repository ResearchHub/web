'use client';

import { FileInput, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';

interface RegisteredReportTabsProps {
  reportId: number;
  slug: string;
  hasSourceProposal: boolean;
  reviewCount: number;
}

export function RegisteredReportTabs({
  reportId,
  slug,
  hasSourceProposal,
  reviewCount,
}: Readonly<RegisteredReportTabsProps>) {
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
                <Star
                  className={`h-4 w-4 mr-2 ${
                    activeTab === 'reviews' ? 'text-primary-500' : 'text-gray-500'
                  }`}
                />
                <span>Peer Reviews</span>
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'reviews'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {reviewCount}
                </span>
              </div>
            ),
          },
        ]
      : []),
  ];

  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={() => {}} className="border-b-0" />;
}
