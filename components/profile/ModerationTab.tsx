'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, MoreHorizontal } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import { useUserDetailsForModerator, useRiskScoreEvents } from '@/hooks/useAuthor';
import { useUserModeration } from '@/hooks/useUserModeration';
import { useUser } from '@/contexts/UserContext';
import { formatTimestamp } from '@/utils/date';
import { snakeCaseToTitleCase } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { RiskScoreEvents } from '@/components/profile/RiskScoreEvents';
import {
  type InsightTone,
  formatInsightLabel,
  getInsightTone,
  getInsightTooltip,
  isPersonaVerificationEvent,
} from '@/components/profile/riskScoreEvents.utils';
import type { UserDetailsForModerator, Insight } from '@/types/user';

type ModerationTabProps = {
  readonly userId: string;
  readonly authorId: number;
  readonly refetchAuthorInfo: () => Promise<void>;
};

type RiskTier = 'trusted' | 'moderate' | 'high' | 'unknown' | 'suspended';

const MISSING_SCORE = -1;
const TRUSTED_SCORE_MAX = 50;
const HIGH_RISK_SCORE_MIN = 150;
const EVENTS_PAGE_SIZE = 10;

function getRiskTier(score: number, isSuspended: boolean): RiskTier {
  if (isSuspended) return 'suspended';
  if (score === MISSING_SCORE) return 'unknown';
  if (score <= TRUSTED_SCORE_MAX) return 'trusted';
  if (score >= HIGH_RISK_SCORE_MIN) return 'high';
  return 'moderate';
}

const TIER_CONFIG: Record<RiskTier, { label: string; scoreClass: string }> = {
  trusted: { label: 'Trusted', scoreClass: 'text-green-700' },
  moderate: { label: 'Moderate', scoreClass: 'text-amber-700' },
  high: { label: 'High Risk', scoreClass: 'text-red-700' },
  suspended: { label: 'Suspended', scoreClass: 'text-red-800' },
  unknown: { label: 'Unknown', scoreClass: 'text-gray-600' },
};

interface InsightItem {
  label: string;
  tone: InsightTone;
  tooltip?: string;
}

function InsightIcon({ tone }: Readonly<{ tone: InsightTone }>) {
  if (tone === 'good') return <ArrowUpRight size={14} className="text-green-600 shrink-0" />;
  if (tone === 'bad') return <ArrowDownRight size={14} className="text-red-600 shrink-0" />;
  return <Minus size={14} className="text-amber-500 shrink-0" />;
}

function buildVerificationTooltip(userDetails: UserDetailsForModerator): string | undefined {
  const verification = userDetails.verification;
  if (verification?.status !== 'APPROVED') return undefined;
  return `Verified as ${verification.firstName} ${verification.lastName} on ${formatTimestamp(verification.createdDate)} via ${snakeCaseToTitleCase(verification.verifiedVia)}`;
}

function buildInsights(
  userDetails: UserDetailsForModerator,
  backendInsights: Insight[]
): InsightItem[] {
  const items: InsightItem[] = [];
  const verificationTooltip = buildVerificationTooltip(userDetails);
  const hasPersonaInsight = backendInsights.some((insight) =>
    isPersonaVerificationEvent(insight.eventType)
  );

  if (!hasPersonaInsight) {
    items.push(
      verificationTooltip
        ? { label: 'Identity Verified', tone: 'good', tooltip: verificationTooltip }
        : { label: 'Not Verified', tone: 'bad', tooltip: 'No identity verification on file' }
    );
  }

  if (userDetails.isProbableSpammer) {
    items.push({
      label: 'Flagged as Spammer',
      tone: 'bad',
      tooltip: 'User has been flagged as a probable spammer',
    });
  }

  if (userDetails.isSuspended) {
    items.push({
      label: 'User Suspended',
      tone: 'bad',
      tooltip: 'User account is currently suspended',
    });
  }

  for (const insight of backendInsights) {
    const tooltip =
      isPersonaVerificationEvent(insight.eventType) && verificationTooltip
        ? verificationTooltip
        : getInsightTooltip(insight);
    items.push({
      label: formatInsightLabel(insight.eventType, insight.count),
      tone: getInsightTone(insight),
      tooltip,
    });
  }

  return items;
}

function ModerationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
        <div className="p-5 pb-4">
          <div className="flex items-center gap-4">
            <span className="bg-gray-200 rounded h-10 w-14 animate-pulse" />
            <span className="bg-gray-200 rounded h-4 w-20 animate-pulse" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {Array.from({ length: 8 }).map((_, skeletonIndex) => (
              <div key={'detail-skeleton-' + skeletonIndex} className="flex items-center gap-2">
                <span className="bg-gray-200 rounded h-4 w-24 animate-pulse" />
                <span className="bg-gray-200 rounded h-4 w-36 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModerationTab({ userId, authorId, refetchAuthorInfo }: ModerationTabProps) {
  const { user: currentUser } = useUser();
  const [{ userDetails, isLoading }, refetchModerationDetails] = useUserDetailsForModerator(userId);
  const [eventsState, fetchEvents] = useRiskScoreEvents(userId, {
    pageSize: EVENTS_PAGE_SIZE,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHubEditor = !!currentUser?.authorProfile?.isHubEditor;
  const isModerator = !!currentUser?.isModerator;

  const [moderationState, { suspendUser, reinstateUser, markProbableSpammer }] =
    useUserModeration();

  const refreshAfterAction = () => Promise.all([refetchAuthorInfo(), refetchModerationDetails()]);

  const executeAction = (action: () => Promise<void>, successMsg: string, failMsg: string) => {
    setIsMenuOpen(false);
    action()
      .then(() => {
        toast.success(successMsg);
        return refreshAfterAction();
      })
      .catch(() => toast.error(failMsg));
  };

  const handleBanUser = () =>
    executeAction(
      () => suspendUser(authorId.toString()),
      'User has been suspended',
      'Failed to suspend user'
    );

  const handleReinstateUser = () =>
    executeAction(
      () => reinstateUser(authorId.toString()),
      'User has been reinstated',
      'Failed to reinstate user'
    );

  const handleFlagUser = () =>
    executeAction(
      () => markProbableSpammer(authorId.toString()),
      'User flagged as probable spammer',
      'Failed to flag user'
    );

  const menuItems = [
    {
      id: 'flag_user',
      label: moderationState.isLoading ? 'Flagging...' : 'Flag user',
      onClick: handleFlagUser,
      show: (isModerator || isHubEditor) && !userDetails?.isProbableSpammer,
    },
    {
      id: 'ban_user',
      label: moderationState.isLoading ? 'Suspending...' : 'Ban User',
      onClick: handleBanUser,
      show: isModerator,
    },
    {
      id: 'reinstate_user',
      label: moderationState.isLoading ? 'Reinstating...' : 'Reinstate User',
      onClick: handleReinstateUser,
      show: isModerator,
    },
  ].filter((item) => item.show);

  if (isLoading) return <ModerationSkeleton />;
  if (!userDetails) return null;

  const verifiedName = userDetails.verification
    ? `${userDetails.verification.firstName} ${userDetails.verification.lastName}`
    : 'N/A';

  const riskScore = userDetails.riskScore;
  const tier = getRiskTier(riskScore, userDetails.isSuspended);
  const tierConfig = TIER_CONFIG[tier];
  const insights = buildInsights(userDetails, eventsState.insights);

  const userIdDisplay = String(userDetails.id ?? '');
  const verificationId = userDetails.verification?.externalId || '';

  const detailItems: { label: string; value: string; copyable?: boolean }[] = [
    { label: 'Email', value: userDetails.email || 'N/A' },
    { label: 'User ID', value: userIdDisplay || 'N/A', copyable: !!userIdDisplay },
    { label: 'Verified name', value: verifiedName },
    { label: 'Verification ID', value: verificationId || 'N/A', copyable: !!verificationId },
    { label: 'ORCID Email', value: userDetails.orcidVerifiedEduEmail || 'N/A' },
  ];

  return (
    <section className="flex flex-col gap-6 pb-20">
      <div className="rounded-xl border overflow-hidden bg-gray-50/80 border-gray-200">
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className={cn('text-3xl font-bold tabular-nums', tierConfig.scoreClass)}>
                  {riskScore === MISSING_SCORE ? '—' : riskScore}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold uppercase tracking-wide',
                    tierConfig.scoreClass
                  )}
                >
                  {tierConfig.label}
                </span>
              </div>

              {userDetails.isProbableSpammer && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">
                  Probable Spammer
                </span>
              )}
            </div>

            {menuItems.length > 0 && (
              <BaseMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                }
                align="end"
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
              >
                {menuItems.map((item) => (
                  <BaseMenuItem
                    key={item.id}
                    onClick={item.onClick}
                    className="flex items-center gap-2"
                    disabled={moderationState.isLoading}
                  >
                    <span>{item.label}</span>
                  </BaseMenuItem>
                ))}
              </BaseMenu>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Details
              </span>
              <div className="flex flex-col gap-2 mt-2 text-sm">
                {detailItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-gray-500 shrink-0">{item.label}:</span>
                    <span className="text-gray-900 truncate min-w-0">{item.value}</span>
                    {item.copyable && <CopyButton value={item.value} />}
                  </div>
                ))}
              </div>
            </div>

            {insights.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Insights
                </span>
                <div className="flex flex-col gap-2 mt-2">
                  {insights.map((insight) => (
                    <div
                      key={`${insight.tone}-${insight.label}`}
                      className="flex items-center gap-1.5"
                    >
                      <InsightIcon tone={insight.tone} />
                      {insight.tooltip ? (
                        <Tooltip content={insight.tooltip} position="right" width="w-64">
                          <span className="text-sm font-medium text-gray-800 border-b border-dotted border-gray-400 cursor-help">
                            {insight.label}
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="text-sm font-medium text-gray-800">{insight.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RiskScoreEvents
        events={eventsState.events}
        count={eventsState.count}
        page={eventsState.page}
        pageSize={eventsState.pageSize}
        isLoading={eventsState.isLoading}
        error={eventsState.error}
        fetchEvents={fetchEvents}
      />
    </section>
  );
}
