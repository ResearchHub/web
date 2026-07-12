'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { CalendarOff, Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { buildWorkUrl, generateSlug } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Application } from '@/types/funding';
import { KeyInsightsModal } from '@/components/modals/KeyInsightsModal';
import { KeyInsightsLine } from '@/components/work/KeyInsights/KeyInsightsLine';
import { KeyInsightsPanel } from '@/components/work/KeyInsights/KeyInsightsPanel';
import { GrantInvitedExpertsSection } from '@/components/Funding/GrantInvitedExpertsSection';
import { useUser } from '@/contexts/UserContext';
import type { AuthorProfile } from '@/types/authorProfile';
import type { User } from '@/types/user';
import { formatCompact } from './FeedItemGrantWithApplicants';

interface FeedItemGrantComprehensiveProps {
  entry: FeedEntry;
  className?: string;
}

const VISIBLE_PROPOSALS = 3;

function canViewGrantInvitedExperts(
  user: User | null | undefined,
  createdBy: AuthorProfile
): boolean {
  if (!user) return false;
  if (user.isModerator) return true;

  const creatorUserId = createdBy.userId ?? createdBy.user?.id;
  if (creatorUserId != null && creatorUserId === user.id) {
    return true;
  }

  const authorId = user.authorProfile?.id;
  if (authorId != null && authorId > 0 && authorId === createdBy.id) {
    return true;
  }

  return false;
}

interface GrantDeploymentProgressProps {
  /** Funder's commitment ceiling — the bar is "full" when deployed reaches this. */
  availableFunding: number;
  /** Amount the funder themselves has actually contributed so far. */
  funderContribution: number;
  /** Amount contributed by the wider community. */
  communityMatch: number;
  showUSD: boolean;
  exchangeRate: number;
}

/**
 * Stacked progress bar where a fully-filled bar = 100% of `availableFunding`
 * deployed. Funder + community contributions split the fill proportionally;
 * overflow past 100% surfaces as a "+%" badge next to the deployed total
 * rather than expanding the bar so the visual stays consistent across cards.
 */
const GrantDeploymentProgress: FC<GrantDeploymentProgressProps> = ({
  availableFunding,
  funderContribution,
  communityMatch,
  showUSD,
  exchangeRate,
}) => {
  const totalDeployed = funderContribution + communityMatch;
  const deployedPct = availableFunding > 0 ? (totalDeployed / availableFunding) * 100 : 0;
  const isOverflow = deployedPct > 100;
  const isFull = deployedPct >= 100;

  // Below 100%: each segment occupies its raw share of `availableFunding`.
  // At/above 100%: keep the bar full and split between funder + community
  // proportionally to their contributions so the community segment never
  // disappears even if the funder out-paces them.
  let funderWidth = 0;
  let communityWidth = 0;
  if (availableFunding > 0 && totalDeployed > 0) {
    if (isOverflow) {
      funderWidth = (funderContribution / totalDeployed) * 100;
      communityWidth = (communityMatch / totalDeployed) * 100;
    } else {
      funderWidth = (funderContribution / availableFunding) * 100;
      communityWidth = (communityMatch / availableFunding) * 100;
    }
  }

  // Round the percentage label for display; show "<1%" when very small but
  // non-zero so users know there's activity.
  const pctLabel =
    deployedPct === 0 ? '0%' : deployedPct < 1 ? '<1%' : `${Math.round(deployedPct)}%`;

  return (
    <div className="w-full">
      <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
        {funderWidth > 0 && (
          <div
            className={cn(
              'absolute inset-y-0 left-0 bg-emerald-300/90',
              // Round only the leading edge unless this segment owns the full bar.
              communityWidth > 0 ? 'rounded-l-full' : 'rounded-full'
            )}
            style={{ width: `${funderWidth}%` }}
          />
        )}
        {communityWidth > 0 && (
          <div
            className={cn(
              'absolute inset-y-0 bg-orange-300/90',
              funderWidth > 0 ? 'rounded-r-full' : 'rounded-full'
            )}
            style={{ left: `${funderWidth}%`, width: `${communityWidth}%` }}
          />
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-white/70">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="uppercase tracking-wider">Funder</span>
            <span className="text-white font-mono font-semibold">
              {formatCompact(funderContribution, showUSD, exchangeRate)}
            </span>
          </span>
          {/* Always surface the community line when there's a match, even
              when the bar is capped, so it remains attributable. */}
          {communityMatch > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
              <span className="uppercase tracking-wider">Community</span>
              <span className="text-white font-mono font-semibold">
                {formatCompact(communityMatch, showUSD, exchangeRate)}
              </span>
            </span>
          )}
        </div>
        <span className="font-mono font-semibold text-white whitespace-nowrap">
          {formatCompact(totalDeployed, showUSD, exchangeRate)} deployed
          <span
            className={cn(
              'ml-1.5',
              isOverflow ? 'text-orange-300' : isFull ? 'text-emerald-300' : 'text-white/60'
            )}
          >
            · {pctLabel}
          </span>
        </span>
      </div>
    </div>
  );
};

interface GrantHeaderMetadataRowProps {
  organization: string;
  availableFunding: number;
  funderContribution: number;
  communityMatch: number;
  proposalsCount: number;
  showUSD: boolean;
  exchangeRate: number;
}

const GrantHeaderMetadataRow: FC<GrantHeaderMetadataRowProps> = ({
  organization,
  availableFunding,
  funderContribution,
  communityMatch,
  proposalsCount,
  showUSD,
  exchangeRate,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
        <div className="min-w-0 max-w-[40%]">
          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
            Offered by
          </div>
          <div className="text-base font-extrabold text-white/90 truncate" title={organization}>
            {organization}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
            Available Funding
          </div>
          <div className="text-base font-extrabold font-mono text-emerald-300">
            {formatCompact(availableFunding, showUSD, exchangeRate)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
            Community Match
          </div>
          <div className="text-base font-extrabold font-mono text-orange-300">
            {formatCompact(communityMatch, showUSD, exchangeRate)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
            Proposals
          </div>
          <div className="text-base font-extrabold font-mono text-white/85">{proposalsCount}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
            Duration
          </div>
          <div className="text-base font-extrabold font-mono text-white/85">Rolling</div>
        </div>
      </div>

      <GrantDeploymentProgress
        availableFunding={availableFunding}
        funderContribution={funderContribution}
        communityMatch={communityMatch}
        showUSD={showUSD}
        exchangeRate={exchangeRate}
      />
    </div>
  );
};

interface GrantHeaderProps {
  href: string;
  title: string;
  organization: string;
  previewImage?: string;
  isClosed: boolean;
  availableFunding: number;
  funderContribution: number;
  communityMatch: number;
  proposalsCount: number;
  showUSD: boolean;
  exchangeRate: number;
}

/**
 * Top section of the grant card: hero image with the title overlaid as a
 * white pill, an "Ended" badge when applicable, and a frosted footer hosting
 * the metadata row + deployment progress.
 */
const GrantHeader: FC<GrantHeaderProps> = ({
  href,
  title,
  organization,
  previewImage,
  isClosed,
  availableFunding,
  funderContribution,
  communityMatch,
  proposalsCount,
  showUSD,
  exchangeRate,
}) => {
  return (
    <Link
      href={href}
      className="group block relative h-[260px] sm:h-[220px] overflow-hidden bg-gray-900"
    >
      {previewImage ? (
        <Image
          src={previewImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 660px"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 25% 35%, rgba(251,146,60,0.55) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 55% 55%, rgba(59,130,246,0.45) 0%, transparent 45%), ' +
              'radial-gradient(ellipse at 80% 20%, rgba(244,63,94,0.35) 0%, transparent 40%), ' +
              'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        />
      )}

      {isClosed && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-gray-500/90 text-white text-[11px] border border-gray-400/80 font-semibold px-2 py-0.5 rounded-md shadow-sm">
            <CalendarOff size={11} />
            Ended
          </span>
        </div>
      )}

      {/* Title pill */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-[80%]">
        <h3
          className={cn(
            'inline-block max-w-full bg-white rounded-md shadow-md',
            'px-3.5 py-2 text-base sm:text-lg font-extrabold text-gray-900',
            'tracking-tight leading-snug line-clamp-2'
          )}
        >
          {title}
        </h3>
      </div>

      {/* Frosted footer hosts the metadata row + progress */}
      <div
        className="absolute bottom-0 inset-x-0 px-5 py-3 border-t border-white/[0.06]"
        style={{
          backdropFilter: 'blur(16px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        <GrantHeaderMetadataRow
          organization={organization}
          availableFunding={availableFunding}
          funderContribution={funderContribution}
          communityMatch={communityMatch}
          proposalsCount={proposalsCount}
          showUSD={showUSD}
          exchangeRate={exchangeRate}
        />
      </div>
    </Link>
  );
};

interface ProposalRowProps {
  application: Application;
  showUSD: boolean;
  exchangeRate: number;
  isLast: boolean;
}

/**
 * Proposal row variant used inside the comprehensive card. Mirrors the simple
 * card's row but also surfaces per-proposal key insights (inline below the
 * funder-wide breakpoint, as a side panel above it).
 */
const ProposalRow: FC<ProposalRowProps> = ({ application, showUSD, exchangeRate, isLast }) => {
  const { profile, fundraise: fundraiseRaw } = application;
  const fundraise = fundraiseRaw!;
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const openInsightsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInsightsModalOpen(true);
  };

  const askAmount = showUSD
    ? Math.round(fundraise.goalAmount.usd)
    : Math.round(fundraise.goalAmount.rsc);

  const proposalHref = buildWorkUrl({
    id: application.preregistrationPostId,
    contentType: 'preregistration',
    slug: fundraise.title ? generateSlug(fundraise.title) : undefined,
  });

  const assessedReviews = (application.reviews ?? []).filter((r) => r.isAssessed);
  const reviewAvg =
    assessedReviews.length > 0
      ? assessedReviews.reduce((sum, r) => sum + r.score, 0) / assessedReviews.length
      : 0;
  const hasAssessedReviews = assessedReviews.length > 0;

  return (
    <Link
      href={proposalHref}
      className={cn(
        'grid grid-cols-[75px_1fr] funder-wide:grid-cols-[75px_1fr_340px] items-center gap-3 px-5 py-2.5 hover:bg-gray-50/80 transition-colors cursor-pointer',
        !isLast && 'border-b border-gray-100'
      )}
    >
      {/* Ask amount */}
      <div className="text-center py-1 px-0.5  border-r border-gray-200">
        <div className="text-sm font-extrabold font-mono tracking-tight text-gray-900">
          {formatCompact(askAmount, showUSD, exchangeRate)}
        </div>
        <div className="text-[8.5px] font-bold uppercase text-gray-400 tracking-wide">
          requested
        </div>
      </div>

      {/* Title + author + org + score */}
      <div className="min-w-0">
        <p className="text-[12.5px] font-bold text-gray-900 truncate leading-snug mb-0.5">
          {fundraise.title || profile.fullName}
        </p>
        <div className="flex items-center gap-1.5">
          <Avatar src={profile.profileImage || ''} alt={profile.fullName} size="xxs" />
          {/* Desktop: always show name */}
          <span className="text-[12px] text-gray-500 truncate hidden sm:inline">
            {profile.fullName}
          </span>
          {fundraise.nonprofit?.name ? (
            <>
              {/* Desktop: separator between name and org */}
              <span className="text-gray-300 hidden sm:inline">·</span>
              {/* Both: org name (mobile primary label) */}
              <span className="text-[11px] text-gray-500 truncate">{fundraise.nonprofit.name}</span>
            </>
          ) : (
            /* Mobile fallback: name when no org */
            <span className="text-[12px] text-gray-500 truncate sm:hidden">{profile.fullName}</span>
          )}
          {hasAssessedReviews && (
            <>
              <span className="text-gray-300">·</span>
              <Tooltip
                content={
                  <PeerReviewTooltip
                    reviews={assessedReviews}
                    averageScore={reviewAvg}
                    href={proposalHref}
                  />
                }
                position="top"
                width="w-[320px]"
              >
                <span
                  className="inline-flex items-center gap-1 text-[12px] text-gray-600 whitespace-nowrap cursor-help"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {reviewAvg.toFixed(1)}
                </span>
              </Tooltip>
            </>
          )}
        </div>

        {/* Inline insights — all widths below funder-wide. Sits below the author meta row,
            wrapped in a subtle gradient callout. */}
        {application.keyInsight && (
          <div className="funder-wide:hidden">
            <KeyInsightsLine keyInsight={application.keyInsight} onOpenModal={openInsightsModal} />
          </div>
        )}
      </div>

      {/* Side panel insights — funder-wide+ */}
      <div className="hidden funder-wide:block self-stretch border-l border-gray-200 pl-4">
        {application.keyInsight ? (
          <KeyInsightsPanel keyInsight={application.keyInsight} onOpenModal={openInsightsModal} />
        ) : (
          <div className="text-[11px] text-gray-400 italic pt-1">No insights yet</div>
        )}
      </div>

      {application.keyInsight && (
        <KeyInsightsModal
          isOpen={isInsightsModalOpen}
          onClose={() => setIsInsightsModalOpen(false)}
          keyInsight={application.keyInsight}
        />
      )}
    </Link>
  );
};

/**
 * Comprehensive grant card used on the funder dashboard (`/fund/dashboard`).
 * Surfaces the deployment progress bar, community match, funder contribution
 * and per-proposal key insights. The simpler public-facing variant lives in
 * `FeedItemGrantWithApplicants`.
 */
export const FeedItemGrantComprehensive: FC<FeedItemGrantComprehensiveProps> = ({
  entry,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { user } = useUser();
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'proposals' | 'invited'>('proposals');
  const [invitedTotal, setInvitedTotal] = useState<number | null>(null);

  const content = entry.content as FeedGrantContent;
  const grant = content.grant;

  if (!grant) {
    return null;
  }

  const href = buildWorkUrl({
    id: content.id,
    contentType: 'funding_request',
    slug: content.slug,
  });

  const budgetAmount = showUSD
    ? Math.round(grant.amount?.usd || 0)
    : Math.round(grant.amount?.rsc || 0);

  const allProposals = grant.applicants?.filter((a) => a.fundraise) ?? [];
  const shown = expanded ? allProposals : allProposals.slice(0, VISIBLE_PROPOSALS);
  const remaining = allProposals.length - VISIBLE_PROPOSALS;
  const hasProposals = allProposals.length > 0;

  const unifiedDocumentId = content.unifiedDocumentId
    ? Number(content.unifiedDocumentId)
    : undefined;
  const canViewInvitedExperts = canViewGrantInvitedExperts(user, grant.createdBy);
  const showInvitedExperts =
    canViewInvitedExperts && unifiedDocumentId != null && !Number.isNaN(unifiedDocumentId);
  const showSectionTabs = hasProposals && showInvitedExperts;

  const isClosed = grant.status === 'CLOSED' || grant.isExpired || !grant.isActive;

  // Walk every applicant's contributor list and bucket each contribution into
  // either the funder's own bucket (when the contributor matches `grant.createdBy`)
  // or the community match bucket. For USD totals we prefer `rscUsdSnapshot`
  // (frozen at contribution time) so the displayed sums don't drift with the
  // live RSC price; we still fall back to the live exchange rate if the
  // backend doesn't carry a snapshot for older contributions.
  const funderAuthorProfileId = grant.createdBy?.id;
  const funderUserId = grant.createdBy?.user?.id ?? grant.createdBy?.userId;

  const { funderContribution, communityMatch } = allProposals.reduce(
    (acc, application) => {
      const contributors = application.fundraise?.contributors?.top ?? [];
      for (const c of contributors) {
        const rsc = c.totalContribution.rsc ?? 0;
        const directUsd = c.totalContribution.usd ?? 0;
        const snapshotUsd = c.totalContribution.rscUsdSnapshot;
        const value = showUSD
          ? snapshotUsd != null
            ? snapshotUsd + directUsd
            : rsc * exchangeRate + directUsd
          : rsc;

        const isFunder =
          (funderAuthorProfileId != null && c.authorProfileId === funderAuthorProfileId) ||
          (funderUserId != null && c.id === funderUserId);

        if (isFunder) {
          acc.funderContribution += value;
        } else {
          acc.communityMatch += value;
        }
      }
      return acc;
    },
    { funderContribution: 0, communityMatch: 0 }
  );

  return (
    <div
      className={cn(
        'bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <GrantHeader
        href={href}
        title={grant.shortTitle || content.title}
        organization={grant.organization || content.organization || 'ResearchHub Grant'}
        previewImage={content.previewImage}
        isClosed={isClosed}
        availableFunding={budgetAmount}
        funderContribution={Math.round(funderContribution)}
        communityMatch={Math.round(communityMatch)}
        proposalsCount={allProposals.length}
        showUSD={showUSD}
        exchangeRate={exchangeRate}
      />

      {/* Proposal rows */}
      {hasProposals && (
        <>
          {showSectionTabs ? (
            <ButtonGroup
              variant="section"
              value={activeSection}
              onChange={(value) => setActiveSection(value as 'proposals' | 'invited')}
              options={[
                {
                  value: 'proposals',
                  label: `Applicant Proposals (${allProposals.length})`,
                },
                {
                  value: 'invited',
                  label: `Invited Experts${invitedTotal != null ? ` (${invitedTotal})` : ''}`,
                },
              ]}
            />
          ) : (
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Applicant Proposals
              </span>
            </div>
          )}

          {(!showSectionTabs || activeSection === 'proposals') && (
            <div>
              {shown.map((application, i) => (
                <ProposalRow
                  key={`${application.profile.id}-${application.fundraise!.id}-${i}`}
                  application={application}
                  showUSD={showUSD}
                  exchangeRate={exchangeRate}
                  isLast={
                    i === shown.length - 1 && (expanded || allProposals.length <= VISIBLE_PROPOSALS)
                  }
                />
              ))}
              {!expanded && remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="w-full px-5 py-2.5 text-center text-xs font-semibold text-blue-500 hover:bg-gray-50/80 transition-colors border-t border-gray-100 cursor-pointer"
                >
                  Show {remaining} more proposal{remaining > 1 ? 's' : ''}
                </button>
              )}
              {expanded && remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="w-full px-5 py-2.5 text-center text-xs font-semibold text-gray-400 hover:bg-gray-50/80 transition-colors border-t border-gray-100 cursor-pointer"
                >
                  Show less
                </button>
              )}
            </div>
          )}

          {showInvitedExperts && (
            <GrantInvitedExpertsSection
              unifiedDocumentId={unifiedDocumentId!}
              canView={canViewInvitedExperts}
              variant="tab-panel"
              isActive={activeSection === 'invited'}
              onTotalChange={setInvitedTotal}
            />
          )}
        </>
      )}

      {/* No proposals — placeholder; funder dashboard gets expand control below */}
      {!hasProposals && !isClosed && (
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="px-5 py-4">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <RadiatingDot color="bg-emerald-500" size="sm" />
              <span className="text-[11px] font-semibold text-gray-700">
                Experts have been invited to apply
              </span>
            </div>
            <p className="text-[11px] text-gray-600 text-center">
              Anyone can apply. Be the first to submit yours.
            </p>
          </div>
          {showInvitedExperts && (
            <GrantInvitedExpertsSection
              unifiedDocumentId={unifiedDocumentId!}
              canView={canViewInvitedExperts}
              variant="standalone"
              onTotalChange={setInvitedTotal}
            />
          )}
        </div>
      )}
    </div>
  );
};
