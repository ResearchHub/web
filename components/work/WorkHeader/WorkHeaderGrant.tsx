'use client';

import { type ReactNode, useState, useCallback } from 'react';
import { Bell, Coins, FileText, FileUp, Lock } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileSignature } from '@fortawesome/pro-light-svg-icons';
import { faFileSignature as faFileSignatureSolid } from '@fortawesome/pro-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useGrantTab, type GrantBannerTab } from '@/components/Funding/GrantPageContent';
import { useFundraises } from '@/contexts/FundraiseContext';
import { useUser } from '@/contexts/UserContext';
import type { FundingPool, FundingPoolAmount, GrantApplicationVisibility } from '@/types/grant';
import { ID } from '@/types/root';
import { WorkHeader } from './WorkHeader';
import { WorkHeaderGrantEyebrow } from './WorkHeaderGrantEyebrow';
import { GrantFundingPoolWidget } from './GrantFundingPoolWidget';
import { PendingReviewBadge } from './PendingReviewBadge';

interface WorkHeaderGrantProps {
  work: Work;
  metadata: WorkMetadata;
  amountUsd?: number;
  /** The grant's own amount, before any community contributions. */
  grantAmount?: FundingPoolAmount | null;
  grantId?: string;
  isActive?: boolean;
  isPending?: boolean;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
  fundingPool?: FundingPool | null;
  grantCreatedByUserId?: ID | null;
  className?: string;
  preTitle?: ReactNode;
}

export function WorkHeaderGrant({
  work,
  metadata,
  amountUsd,
  grantAmount = null,
  grantId,
  isActive = true,
  isPending = false,
  organization,
  applicationVisibility,
  fundingPool: fundingPoolProp = null,
  grantCreatedByUserId = null,
  className,
  preTitle,
}: WorkHeaderGrantProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const {
    activeTab,
    setActiveTab,
    activity,
    fundingPool: contextPool,
    setFundingPool,
  } = useGrantTab();
  const { proposalCount } = useFundraises();

  const fundingPool = contextPool ?? fundingPoolProp;

  const handleTabChange = useCallback(
    (tabId: string) => setActiveTab(tabId as GrantBannerTab),
    [setActiveTab]
  );

  const isGrantCreator =
    user?.id != null &&
    grantCreatedByUserId != null &&
    Number(user.id) === Number(grantCreatedByUserId);
  const canManagePool = isGrantCreator || !!user?.isModerator;

  // The pool widget replaces the amount eyebrow and the bare Contribute button
  // whenever the grant has a pool, open or closed.
  const showPoolWidget = !!fundingPool && !!grantAmount;
  const isPoolOpen = !!grantId && isActive && fundingPool?.status === 'OPEN';

  const eyebrow = showPoolWidget ? (
    isPending ? (
      <PendingReviewBadge />
    ) : null
  ) : (
    <WorkHeaderGrantEyebrow amountUsd={amountUsd} isActive={isActive} isPending={isPending} />
  );

  const requiresPrivateApplications = applicationVisibility === 'PRIVATE';

  const handleContributeSuccess = useCallback(
    (updatedPool?: FundingPool) => {
      setIsContributeModalOpen(false);
      if (updatedPool) setFundingPool(updatedPool);
      router.refresh();
    },
    [router, setFundingPool]
  );

  const subtitle = organization ? (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-base text-gray-500">Offered by</span>
      <span className="text-base text-gray-600 font-medium">{organization}</span>
    </div>
  ) : undefined;

  const submitProposalButton =
    grantId && isActive ? (
      <SubmitProposalTooltip isPrivate={requiresPrivateApplications}>
        <Button
          data-testid="grant-submit-proposal"
          variant="default"
          size="lg"
          onClick={() => setIsApplyModalOpen(true)}
          className="gap-2 w-full sm:flex-1 max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
        >
          Submit Proposal
          <FileUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </SubmitProposalTooltip>
    ) : null;

  const privateApplicationsNote = requiresPrivateApplications ? (
    <div className="hidden sm:flex items-center justify-center gap-1.5 text-xs text-gray-500">
      <Lock className="h-3 w-3 shrink-0" />
      <span>Your proposal will be submitted privately</span>
    </div>
  ) : null;

  let primaryAction: ReactNode;
  if (showPoolWidget && fundingPool && grantAmount) {
    primaryAction = (
      // At lg+ the right sidebar appears, so the widget takes the sidebar's
      // exact column: w-80 to match, and -mr-8 to cancel the header's px-8 so
      // its right edge lands on the shared 1180px container edge like the
      // sidebar's does. Below lg there is no sidebar to align to.
      <div className="flex w-full flex-col sm:w-[304px] lg:!-mr-8 lg:!w-80">
        <GrantFundingPoolWidget
          organization={organization ?? ''}
          grantAmount={grantAmount}
          fundingPool={fundingPool}
          isOpen={isPoolOpen}
          canApply={!!grantId && isActive}
          applicationVisibility={applicationVisibility}
          canManagePool={canManagePool}
          onApply={() => setIsApplyModalOpen(true)}
          onContribute={() => setIsContributeModalOpen(true)}
        />
        {isPoolOpen && (
          <p
            className="mt-2 px-1 text-center text-xs leading-snug text-gray-500"
            data-testid="grant-funding-pool-value-line"
          >
            Every dollar you add goes to the proposals. {organization || 'the funder'} picks.
          </p>
        )}
      </div>
    );
  } else if (grantId && isActive) {
    primaryAction = (
      <>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {isPoolOpen && (
            <Button
              data-testid="grant-contribute"
              variant="outlined"
              size="lg"
              onClick={() => setIsContributeModalOpen(true)}
              className="gap-2 w-full sm:flex-1 max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              Contribute
            </Button>
          )}
          {submitProposalButton}
        </div>
        {privateApplicationsNote}
      </>
    );
  }

  const activityCount = activity.count;
  const activityCountLabel =
    activityCount > 0 && activity.hasMore ? `${activityCount}+` : activityCount;

  const grantTabs = [
    {
      id: 'details' as const,
      label: (
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <span>Details</span>
        </div>
      ),
    },
    {
      id: 'proposals' as const,
      label: (
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={activeTab === 'proposals' ? faFileSignatureSolid : faFileSignature}
            className="h-4 w-4 mr-2"
          />
          <span>Proposals</span>
          {proposalCount > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'proposals'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {proposalCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'activity' as const,
      label: (
        <div className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          <span>Updates</span>
          {activityCount > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'activity'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activityCountLabel}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Beside the pool widget the tabs sit on the header's own bottom edge, so
  // their own rule would only double it.
  const tabs = (
    <Tabs
      tabs={grantTabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      className={showPoolWidget ? '!border-b-0' : undefined}
    />
  );

  const grantTitle = work.note?.post?.grant?.shortTitle || work.title;

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        className={className}
        eyebrow={eyebrow}
        preTitle={preTitle}
        subtitle={subtitle}
        tabs={tabs}
        primaryAction={primaryAction}
        hideVoteWidget
        alignTop={showPoolWidget}
        // The pool widget is tall: the tabs fill the room under the title
        // beside it, level with its footnote, instead of a row beneath both.
        inlineTabs={showPoolWidget}
        grantModalProps={
          grantId
            ? {
                isApplyToGrantModalOpen: isApplyModalOpen,
                onCloseApplyToGrantModal: () => setIsApplyModalOpen(false),
                grantId,
                grantApplicationVisibility: applicationVisibility,
              }
            : undefined
        }
      />

      {fundingPool?.status === 'OPEN' && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundingPool={fundingPool}
          proposalTitle={grantTitle}
        />
      )}
    </>
  );
}
