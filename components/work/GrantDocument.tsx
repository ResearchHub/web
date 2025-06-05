'use client';

import { useState, useMemo } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkTabs, TabType } from './WorkTabs';
import { CommentFeed } from '@/components/Comment/CommentFeed';
import { GrantApplications } from './GrantApplications';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { differenceInCalendarDays, format } from 'date-fns';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
}

export const GrantDocument = ({ work, metadata, defaultTab = 'paper' }: GrantDocumentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderGrantInfo = () => {
    return (
      <div className="space-y-6 mt-6">
        {/* Objectives (replacing Purpose) */}
        {(work as any).objectives?.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Objectives</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {(work as any).objectives.map((obj: string, idx: number) => (
                <li key={`objective-${idx}`}>{obj}</li>
              ))}
            </ul>
          </div>
        ) : (
          work.abstract && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Objectives</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{work.abstract}</p>
            </div>
          )
        )}

        {/* Eligibility Requirements */}
        {(work as any).eligibilityRequirements?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eligibility Requirements</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {(work as any).eligibilityRequirements.map((req: string, idx: number) => (
                <li key={`eligibility-${idx}`}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Opens/Deadline removed to declutter objectives section */}
      </div>
    );
  };

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'paper':
        return renderGrantInfo();
      case 'reviews':
        // Applications tab
        return (
          <div className="space-y-6" key="applications-tab">
            <GrantApplications grantId={work.id} />
          </div>
        );
      case 'conversation':
        return (
          <div className="space-y-6" key="conversation-tab">
            <CommentFeed
              documentId={work.id}
              contentType={work.contentType}
              commentType="GENERIC_COMMENT"
              key={`comment-feed-${work.id}`}
            />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, work, metadata]);

  return (
    <div>
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <WorkLineItems work={work} showClaimButton={false} />

      {/* Top summary as line items */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* Funding */}
        {metadata.fundraising?.goalAmount && (
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-28">Amount</span>
            <div className="flex flex-row items-center gap-2">
              <CurrencyBadge
                amount={250000}
                currency="USD"
                variant="text"
                showText={true}
                showIcon={true}
                textColor="text-indigo-600"
                className="font-semibold p-0"
                shorten={false}
                showExchangeRate={true}
              />
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-sm text-gray-600">Multiple applicants can be selected</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-start">
          <span className="font-medium text-gray-900 w-28">Status</span>
          <div className="flex-1 text-sm">
            <div className="flex items-center gap-2 text-gray-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>Accepting Applications</span>
              {metadata.fundraising?.endDate &&
                differenceInCalendarDays(new Date(metadata.fundraising.endDate), new Date()) >
                  0 && (
                  <>
                    <div className="h-4 w-px bg-gray-300" />
                    <span className="text-gray-600 text-sm">
                      Closes {format(new Date(metadata.fundraising.endDate), 'MMMM d, yyyy')}
                    </span>
                  </>
                )}
            </div>
            {metadata.fundraising?.endDate &&
              differenceInCalendarDays(new Date(metadata.fundraising.endDate), new Date()) <= 0 && (
                <div className="text-gray-600">
                  Closed on {format(new Date(metadata.fundraising.endDate), 'MMMM d, yyyy')}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <WorkTabs
        work={work}
        metadata={metadata}
        defaultTab={defaultTab}
        contentType="grant"
        onTabChange={handleTabChange}
      />

      {/* Tab content */}
      {renderTabContent}
    </div>
  );
};
