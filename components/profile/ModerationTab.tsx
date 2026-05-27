'use client';

import React, { useMemo, useState } from 'react';
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
import { RiskScoreEvents } from '@/components/profile/RiskScoreEvents';
import type { UserDetailsForModerator, Insight } from '@/types/user';

type ModerationTabProps = {
  readonly userId: string;
  readonly authorId: number;
  readonly refetchAuthorInfo: () => Promise<void>;
};

type RiskTier = 'trusted' | 'moderate' | 'high' | 'unknown';

function getRiskTier(score: number): RiskTier {
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

function buildInsights(
  userDetails: UserDetailsForModerator,
  backendInsights: Insight[]
): InsightItem[] {
  const items: InsightItem[] = [];

  if (userDetails.verification?.status === 'APPROVED') {
    const v = userDetails.verification;
    const tooltip = `Verified as ${v.firstName} ${v.lastName} on ${formatTimestamp(v.createdDate)} via ${snakeCaseToTitleCase(v.verifiedVia)}`;
    items.push({ label: 'Identity Verified', variant: 'positive', tooltip });
  } else {
    items.push({
      label: 'Not Verified',
      variant: 'negative',
      tooltip: 'No identity verification on file',
    });
  }

  if (userDetails.isProbableSpammer) {
    items.push({ label: 'Flagged as Spammer', variant: 'negative' });
  }

  if (userDetails.isSuspended) {
    items.push({ label: 'User Suspended', variant: 'negative' });
  }

  for (const insight of backendInsights) {
    const variant = SENTIMENT_TO_VARIANT[insight.sentiment] ?? 'mixed';
    const tooltip = getInsightTooltip(insight);
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

  const handleBanUser = () => {
    setIsMenuOpen(false);
    suspendUser(authorId.toString())
      .then(() => {
        toast.success('User has been suspended successfully');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to suspend user:', error);
        toast.error('Failed to suspend user. Please try again.');
      });
  };

  const handleReinstateUser = () => {
    setIsMenuOpen(false);
    reinstateUser(authorId.toString())
      .then(() => {
        toast.success('User has been reinstated successfully');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to reinstate user:', error);
        toast.error('Failed to reinstate user. Please try again.');
      });
  };

  const handleFlagUser = () => {
    setIsMenuOpen(false);
    markProbableSpammer(authorId.toString())
      .then(() => {
        toast.success('User flagged as probable spammer');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to flag user:', error);
        toast.error('Failed to flag user. Please try again.');
      });
  };

  const menuItems = useMemo(() => {
    const items: { id: string; label: string; onClick: () => void; show: boolean }[] = [
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
    ];
    return items.filter((i) => i.show);
  }, [isModerator, isHubEditor, userDetails, moderationState.isLoading]);

  if (isLoading) return <ModerationSkeleton />;
  if (!userDetails) return null;

  const verifiedName = userDetails.verification
    ? `${userDetails.verification.firstName} ${userDetails.verification.lastName}`
    : 'N/A';
  const verificationVia = userDetails.verification
    ? `${snakeCaseToTitleCase(userDetails.verification.verifiedVia)} on ${formatTimestamp(
        userDetails.verification.createdDate
      )}`
    : 'N/A';

  const riskScore = userDetails.riskScore;
  const tier = getRiskTier(riskScore);
  const tierConfig = TIER_CONFIG[tier];
  const insights = buildInsights(userDetails, eventsState.insights);

  const detailItems: { label: string; value: React.ReactNode }[] = [
    { label: 'User ID', value: userDetails.id ?? 'N/A' },
    { label: 'ORCID Connected', value: userDetails.isOrcidConnected ? 'Yes' : 'No' },
    { label: 'Verified name', value: verifiedName },
    { label: 'Verification via', value: verificationVia },
    { label: 'Verification ID', value: userDetails.verification?.externalId || 'N/A' },
    { label: 'Verified status', value: userDetails.verification?.status || 'N/A' },
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

                <div className="flex flex-wrap items-center gap-2">
                  {userDetails.isSuspended && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                      Suspended
                    </span>
                  )}
                  {userDetails.isProbableSpammer && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">
                      Probable Spammer
                    </span>
                  )}
                </div>
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

        {/* Details */}
        <div className={cn('px-5 py-4', showRiskScore && 'border-t border-black/5 mt-4')}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Details
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-sm">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-medium text-gray-500 shrink-0">Email:</span>
              <span className="text-gray-900 break-words min-w-0">
                {userDetails.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-medium text-gray-500 shrink-0">Suspended:</span>
              <span
                className={cn(
                  'min-w-0',
                  userDetails.isSuspended ? 'text-red-600 font-medium' : 'text-gray-900'
                )}
              >
                {userDetails.isSuspended ? 'Yes' : 'No'}
              </span>
            </div>
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-medium text-gray-500 shrink-0">{item.label}:</span>
                <span className="text-gray-900 break-words min-w-0">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {showRiskScore && insights.length > 0 && (
          <div className="px-5 pb-5 pt-3 border-t border-black/5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Insights
            </span>
            <div className="flex flex-col gap-1.5 mt-1.5">
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
