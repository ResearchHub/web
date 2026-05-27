'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, Minus, MoreHorizontal } from 'lucide-react';
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

function buildInsights(
  userDetails: UserDetailsForModerator,
  backendInsights: Insight[]
): InsightItem[] {
  const items: InsightItem[] = [];

  if (userDetails.verification?.status === 'APPROVED') {
    items.push({ label: 'Identity Verified', variant: 'positive' });
  } else {
    items.push({ label: 'Not Verified', variant: 'negative' });
  }

  if (userDetails.isProbableSpammer) {
    items.push({ label: 'Flagged as Spammer', variant: 'negative' });
  }

  if (userDetails.isSuspended) {
    items.push({ label: 'Account Suspended', variant: 'negative' });
  }

  for (const insight of backendInsights) {
    const variant = SENTIMENT_TO_VARIANT[insight.sentiment] ?? 'mixed';
    items.push({ label: formatEventLabel(insight.eventType, insight.count), variant });
  }

  return items;
}

function ModerationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border p-5 bg-gray-50">
        <div className="flex items-center gap-4">
          <span className="bg-gray-200 rounded h-12 w-16 animate-pulse" />
          <div className="flex flex-col gap-2">
            <span className="bg-gray-200 rounded h-5 w-24 animate-pulse" />
            <span className="bg-gray-200 rounded h-3 w-40 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="bg-gray-200 rounded h-4 w-24 animate-pulse" />
              <span className="bg-gray-200 rounded h-4 w-36 animate-pulse" />
            </div>
          ))}
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
    ? `${userDetails.verification.verifiedVia} on ${formatTimestamp(
        userDetails.verification.createdDate
      )}`
    : 'N/A';

  const riskScore = userDetails.riskScore;
  const tier = getRiskTier(riskScore);
  const tierConfig = TIER_CONFIG[tier];
  const insights = buildInsights(userDetails, eventsState.insights);

  const detailItems: { label: string; value: React.ReactNode }[] = [
    { label: 'Email', value: userDetails.email || 'N/A' },
    { label: 'User ID', value: userDetails.id ?? 'N/A' },
    { label: 'Likely spammer?', value: userDetails.isProbableSpammer ? 'Yes' : 'No' },
    { label: 'Suspended?', value: userDetails.isSuspended ? 'Yes' : 'No' },
    { label: 'ORCID Connected?', value: userDetails.isOrcidConnected ? 'Yes' : 'No' },
    { label: 'Verified name', value: verifiedName },
    { label: 'Verification via', value: verificationVia },
    { label: 'Verification ID', value: userDetails.verification?.externalId || 'N/A' },
    { label: 'Verified status', value: userDetails.verification?.status || 'N/A' },
    { label: 'ORCID Email', value: userDetails.orcidVerifiedEduEmail || 'N/A' },
  ];

  return (
    <section className="flex flex-col gap-6">
      {/* Zone 1: User Details Card */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {detailItems.map((item) => (
            <div key={item.label} className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-medium text-gray-500 shrink-0">{item.label}:</span>
              <span className="text-gray-900 break-words min-w-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone 2: Risk Score Hero Card */}
      {showRiskScore && (
        <div className={cn('rounded-xl border p-5', tierConfig.cardClass)}>
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

          {insights.length > 0 && (
            <div className="mt-4 pt-3 border-t border-black/5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Insights
              </span>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {insights.map((insight) => (
                  <div key={insight.label} className="flex items-center gap-1.5">
                    <InsightIcon variant={insight.variant} />
                    <span className="text-sm font-medium text-gray-800">{insight.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone 3: Risk Score Events */}
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
