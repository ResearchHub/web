'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import type { UserDetailsForModerator, Insight } from '@/types/user';

type ModerationTabProps = {
  readonly userId: string;
  readonly authorId: number;
  readonly refetchAuthorInfo: () => Promise<void>;
};

type RiskTier = 'trusted' | 'moderate' | 'high' | 'unknown' | 'suspended';

function getRiskTier(score: number, isSuspended: boolean): RiskTier {
  if (isSuspended) return 'suspended';
  if (score === -1) return 'unknown';
  if (score <= 50) return 'trusted';
  if (score >= 150) return 'high';
  return 'moderate';
}

const TIER_CONFIG: Record<RiskTier, { label: string; cardClass: string; scoreClass: string }> = {
  trusted: {
    label: 'Trusted',
    cardClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    scoreClass: 'text-green-700',
  },
  moderate: {
    label: 'Moderate',
    cardClass: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200',
    scoreClass: 'text-amber-700',
  },
  high: {
    label: 'High Risk',
    cardClass: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
    scoreClass: 'text-red-700',
  },
  suspended: {
    label: 'Suspended',
    cardClass: 'bg-gradient-to-br from-red-100 to-red-50 border-red-300',
    scoreClass: 'text-red-800',
  },
  unknown: {
    label: 'Unknown',
    cardClass: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
    scoreClass: 'text-gray-600',
  },
};

interface InsightItem {
  label: string;
  variant: 'positive' | 'negative' | 'mixed';
  tooltip?: string;
}

const SENTIMENT_TO_VARIANT: Record<string, InsightItem['variant']> = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  MIXED: 'mixed',
};

const PERSONA_EVENT_TYPES = new Set([
  'PERSONA_VERIFIED',
  'PERSONA_VERIFIED_WHITELISTED',
  'PERSONA_VERIFIED_NON_WHITELISTED',
]);

function InsightIcon({ variant }: { variant: InsightItem['variant'] }) {
  if (variant === 'positive') return <ArrowUpRight size={14} className="text-green-600 shrink-0" />;
  if (variant === 'negative') return <ArrowDownRight size={14} className="text-red-600 shrink-0" />;
  return <Minus size={14} className="text-amber-500 shrink-0" />;
}

function formatEventLabel(eventType: string, count: number): string {
  const label = snakeCaseToTitleCase(eventType);
  return count > 1 ? `${label} (x${count})` : label;
}

const INSIGHT_TOOLTIPS: Record<string, string> = {
  WORK_APPROVED:
    'A paper, proposal, or funding opportunity the user authored was approved by a moderator',
  WORK_DECLINED:
    'A paper, proposal, or funding opportunity the user authored was declined by a moderator',
  CONTENT_CENSORED: 'A paper, post, or comment by the user was removed for policy violations',
  BOUNTY_AWARDED: "The user's solution was selected as the winning answer to a bounty",
  PEER_REVIEW_TIPPED: "The community awarded ResearchCoin to the user's peer review",
  PEER_REVIEW_ASSESSED: "The user's peer review was endorsed by the community or moderation",
  EXPERT_FINDER_SIGNUP: 'The user signed up via an Expert Finder invite',
  EDU_EMAIL_SIGNUP: 'The user registered with a .edu email address',
  ORCID_VERIFIED_EDU: "The user's ORCID profile contains a verified .edu email",
  GOOGLE_SIGNUP: 'The user signed up using Google authentication',
  ACCOUNT_AGE_BONUS: 'The user passed the minimum account-age threshold',
  PERSONA_VERIFIED_WHITELISTED:
    'The user passed Persona ID verification from a whitelisted country',
  PERSONA_VERIFIED_NON_WHITELISTED:
    'The user passed Persona ID verification from a non-whitelisted country',
  WORKS_MODERATED: "Total moderation activity on the user's papers, proposals, and grants",
  PERSONA_VERIFIED: 'The user passed Persona ID verification',
};

const MIXED_TOOLTIPS: Record<string, string> = {
  WORKS_MODERATED: 'User has both approved and declined works, possibly worth reviewing',
  CONTENT_CENSORED: 'User has had content both censored and restored',
};

function getInsightTooltip(insight: Insight): string {
  if (insight.sentiment === 'MIXED') {
    const mixed = MIXED_TOOLTIPS[insight.eventType];
    if (mixed) return mixed;
  }
  const base = INSIGHT_TOOLTIPS[insight.eventType];
  if (base) return base;
  return `User has ${insight.count} event${insight.count !== 1 ? 's' : ''} of this type`;
}

function buildVerificationTooltip(userDetails: UserDetailsForModerator): string | undefined {
  const v = userDetails.verification;
  if (v?.status !== 'APPROVED') return undefined;
  return `Verified as ${v.firstName} ${v.lastName} on ${formatTimestamp(v.createdDate)} via ${snakeCaseToTitleCase(v.verifiedVia)}`;
}

function buildInsights(
  userDetails: UserDetailsForModerator,
  backendInsights: Insight[]
): InsightItem[] {
  const items: InsightItem[] = [];
  const verificationTooltip = buildVerificationTooltip(userDetails);
  const hasPersonaInsight = backendInsights.some((i) => PERSONA_EVENT_TYPES.has(i.eventType));

  if (!hasPersonaInsight) {
    items.push(
      verificationTooltip
        ? { label: 'Identity Verified', variant: 'positive', tooltip: verificationTooltip }
        : {
            label: 'Not Verified',
            variant: 'negative',
            tooltip: 'No identity verification on file',
          }
    );
  }

  if (userDetails.isProbableSpammer) {
    items.push({
      label: 'Flagged as Spammer',
      variant: 'negative',
      tooltip: 'User has been flagged as a probable spammer',
    });
  }

  if (userDetails.isSuspended) {
    items.push({
      label: 'User Suspended',
      variant: 'negative',
      tooltip: 'User account is currently suspended',
    });
  }

  for (const insight of backendInsights) {
    const variant = SENTIMENT_TO_VARIANT[insight.sentiment] ?? 'mixed';
    const tooltip =
      PERSONA_EVENT_TYPES.has(insight.eventType) && verificationTooltip
        ? verificationTooltip
        : getInsightTooltip(insight);
    items.push({ label: formatEventLabel(insight.eventType, insight.count), variant, tooltip });
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
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
  const searchParams = useSearchParams();
  const showRiskScore = searchParams.get('riskscore') === 'true';
  const [{ userDetails, isLoading }, refetchModerationDetails] = useUserDetailsForModerator(userId);
  const [eventsState, fetchEvents] = useRiskScoreEvents(showRiskScore ? userId : null, {
    pageSize: 10,
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
  ].filter((i) => i.show);

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

  const detailItems: { label: string; value: React.ReactNode }[] = [
    { label: 'Email', value: userDetails.email || 'N/A' },
    {
      label: 'User ID',
      value: userIdDisplay ? (
        <span className="inline-flex items-center gap-1">
          {userIdDisplay} <CopyButton value={userIdDisplay} />
        </span>
      ) : (
        'N/A'
      ),
    },
    { label: 'Verified name', value: verifiedName },
    {
      label: 'Verification ID',
      value: verificationId ? (
        <span className="inline-flex items-center gap-1">
          {verificationId} <CopyButton value={verificationId} />
        </span>
      ) : (
        'N/A'
      ),
    },
    { label: 'ORCID Email', value: userDetails.orcidVerifiedEduEmail || 'N/A' },
  ];

  return (
    <section className="flex flex-col gap-6 pb-20">
      {/* Combined Moderation Card */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden',
          showRiskScore ? tierConfig.cardClass : 'bg-gray-50 border-gray-200'
        )}
      >
        {/* Score Header */}
        {showRiskScore && (
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-3xl font-bold tabular-nums', tierConfig.scoreClass)}>
                    {riskScore === -1 ? '—' : riskScore}
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
        )}

        {/* Details + Insights */}
        <div className={cn('px-5 py-4', showRiskScore && 'border-t border-black/5 mt-4')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Details Column */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Details
              </span>
              <div className="flex flex-col gap-2 mt-2 text-sm">
                {detailItems.map((item) => (
                  <div key={item.label} className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-medium text-gray-500 shrink-0">{item.label}:</span>
                    <span className="text-gray-900 break-words min-w-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Column */}
            {showRiskScore && insights.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Insights
                </span>
                <div className="flex flex-col gap-2 mt-2">
                  {insights.map((insight) => (
                    <div key={insight.label} className="flex items-center gap-1.5">
                      <InsightIcon variant={insight.variant} />
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

      {/* Risk Score Events */}
      {showRiskScore && (
        <RiskScoreEvents
          events={eventsState.events}
          count={eventsState.count}
          page={eventsState.page}
          pageSize={eventsState.pageSize}
          isLoading={eventsState.isLoading}
          error={eventsState.error}
          fetchEvents={fetchEvents}
        />
      )}
    </section>
  );
}
