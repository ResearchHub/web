'use client';

import { useState, useCallback } from 'react';
import { ArrowUpFromLine } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { useGrantTab, type GrantBannerTab } from '@/components/Funding/GrantPageContent';
import { WorkHeader } from './WorkHeader';
import { WorkHeaderGrantEyebrow } from './WorkHeaderGrantEyebrow';

interface WorkHeaderGrantProps {
  work: Work;
  metadata: WorkMetadata;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  isPending?: boolean;
  organization?: string;
  className?: string;
}

export function WorkHeaderGrant({
  work,
  metadata,
  amountUsd,
  grantId,
  isActive = true,
  isPending = false,
  organization,
  className,
}: WorkHeaderGrantProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { activeTab, setActiveTab, activity } = useGrantTab();

  const handleTabChange = useCallback(
    (tabId: string) => setActiveTab(tabId as GrantBannerTab),
    [setActiveTab]
  );

  const eyebrow = (
    <WorkHeaderGrantEyebrow amountUsd={amountUsd} isActive={isActive} isPending={isPending} />
  );

  const subtitle = organization ? (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-base text-gray-500">Offered by</span>
      <span className="text-base text-gray-600 font-medium">{organization}</span>
    </div>
  ) : undefined;

  const primaryAction =
    grantId && isActive ? (
      <SubmitProposalTooltip>
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsApplyModalOpen(true)}
          className="gap-2 w-full max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
        >
          Submit Proposal
          <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </SubmitProposalTooltip>
    ) : undefined;

  const activityCount = activity.count;

  const grantTabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'proposals' as const, label: 'Proposals' },
    {
      id: 'activity' as const,
      label: (
        <div className="flex items-center">
          <span>Activity</span>
          {activityCount > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'activity'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activityCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  const tabs = <Tabs tabs={grantTabs} activeTab={activeTab} onTabChange={handleTabChange} />;

  return (
    <WorkHeader
      work={work}
      metadata={metadata}
      className={className}
      eyebrow={eyebrow}
      subtitle={subtitle}
      tabs={tabs}
      primaryAction={primaryAction}
      hideVoteWidget
      grantModalProps={
        grantId
          ? {
              isApplyToGrantModalOpen: isApplyModalOpen,
              onCloseApplyToGrantModal: () => setIsApplyModalOpen(false),
              grantId,
              grantAmountUsd: amountUsd,
              grantOrganization: organization,
            }
          : undefined
      }
    />
  );
}
