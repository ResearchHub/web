'use client';

import React, { useEffect, useState } from 'react';
import { BookCheck, Feather, ChevronRight } from 'lucide-react';
import { FundingLearnMoreModal } from '@/components/Fund/FundingLearnMoreModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import Link from 'next/link';
import type { TopFunder } from '@/types/leaderboard';

// ─── How Funding Works Step ─────────────────────────────────────────────
interface StepProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step = ({ step, title, description, isLast = false }: StepProps) => (
  <div className="flex gap-3">
    {/* Timeline column: dot + connector */}
    <div className="flex flex-col items-center">
      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-900 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
        {step}
      </div>
      {!isLast && <div className="w-px flex-1 bg-indigo-300 my-0.5" />}
    </div>
    {/* Text column */}
    <div className={isLast ? 'pt-0.5' : 'pt-0.5 pb-5'}>
      <p className="text-sm font-medium text-gray-900 leading-snug">{title}</p>
      <p className="text-xs text-gray-700 leading-relaxed mt-0.5">{description}</p>
    </div>
  </div>
);

// ─── Top Funders List Item ──────────────────────────────────────────────
interface FunderItemProps {
  funder: TopFunder;
  rank: number;
  showUSD: boolean;
}

const FunderItem = ({ funder, rank, showUSD }: FunderItemProps) => {
  const authorId = funder.authorProfile?.id;
  const displayName = funder.authorProfile.fullName;

  return (
    <div
      onClick={() => authorId && navigateToAuthorProfile(authorId)}
      className="grid grid-cols-[24px_36px_1fr_auto] gap-x-2.5 items-center hover:bg-gray-50 py-2.5 px-1 rounded-md cursor-pointer transition-colors"
    >
      {/* Rank */}
      <div className="flex items-center justify-center">
        {rank === 1 ? (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-lg absolute" />
            <span className="relative text-[10px] font-bold text-gray-600 z-10">1</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-gray-400">{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center">
        {authorId ? (
          <AuthorTooltip authorId={authorId}>
            <Avatar
              src={funder.authorProfile.profileImage}
              alt={displayName}
              size="sm"
              authorId={authorId}
            />
          </AuthorTooltip>
        ) : (
          <Avatar src={funder.authorProfile.profileImage} alt={displayName} size="sm" />
        )}
      </div>

      {/* Name + verified */}
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        <span className="text-sm font-medium text-gray-900 truncate">{displayName}</span>
        {funder.isVerified && (
          <div className="flex-shrink-0">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="flex-shrink-0">
        <CurrencyBadge
          amount={funder.totalFunding}
          variant="text"
          size="sm"
          currency={showUSD ? 'USD' : 'RSC'}
          shorten={true}
          showIcon={false}
          showText={showUSD}
          textColor="text-emerald-600"
          className="justify-end"
        />
      </div>
    </div>
  );
};

// ─── Skeleton for funders list ──────────────────────────────────────────
const FundersListSkeleton = () => (
  <div className="space-y-1 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-[24px_36px_1fr_auto] gap-x-2.5 items-center py-2.5 px-1"
      >
        <div className="w-5 h-5 bg-gray-100 rounded" />
        <div className="w-8 h-8 bg-gray-100 rounded-full" />
        <div className="h-3.5 bg-gray-100 rounded w-20" />
        <div className="h-3.5 bg-gray-100 rounded w-10" />
      </div>
    ))}
  </div>
);

// ─── Resource Link ──────────────────────────────────────────────────────
interface ResourceLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const ResourceLink = ({ href, icon, label }: ResourceLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between py-2.5 group"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </div>
    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
  </a>
);

// ─── Section Header ─────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    {action}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────
export const FundRightSidebar = () => {
  const { data, isLoading, error, fetchData } = useLeaderboard();
  const { showUSD } = useCurrencyPreference();
  const funders = data?.funders || [];
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white rounded-xl border-gray-200 divide-y divide-gray-200 overflow-hidden">
      <FundingLearnMoreModal isOpen={showLearnMore} onClose={() => setShowLearnMore(false)} />

      {/* ── How Funding Works ───────────────────────────────────── */}
      <div className="p-5">
        <SectionHeader
          title="How Funding Works"
          action={
            <button
              onClick={() => setShowLearnMore(true)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
            >
              Learn more
              <ChevronRight size={12} />
            </button>
          }
        />

        <div className="mt-1">
          <Step step={1} title="Post Opportunity" description="Funders set clear goals" />
          <Step step={2} title="Proposals submitted" description="Researchers submit proposals" />
          <Step step={3} title="Community Validates" description="Experts review proposals" />
          <Step step={4} title="Fund best" description="Funder funds best proposals" isLast />
        </div>
      </div>

      {/* ── Top Funders ─────────────────────────────────────────── */}
      <div className="p-5">
        <SectionHeader
          title="Top Funders"
          action={
            <Link
              href="/leaderboard?tab=funders"
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
            >
              This Month
              <ChevronRight size={12} />
            </Link>
          }
        />

        {isLoading ? (
          <FundersListSkeleton />
        ) : error ? (
          <p className="text-xs text-red-500 py-2">{error}</p>
        ) : funders.length > 0 ? (
          <div>
            {funders.map((funder, index) => (
              <FunderItem key={funder.id} funder={funder} rank={index + 1} showUSD={showUSD} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No funders this month</p>
        )}
      </div>

      {/* ── Resources ───────────────────────────────────────────── */}
      <div className="p-5">
        <SectionHeader title="Resources" />

        <div className="divide-y divide-gray-100">
          <ResourceLink
            href="https://blog.researchhub.foundation/funding-for-researchers/"
            icon={<BookCheck size={15} className="text-gray-400" />}
            label="Funding Guidelines"
          />
          <ResourceLink
            href="https://drive.google.com/file/d/1wQVjVfy4x6VadIExEysx4VyLJN9dkD53/view"
            icon={<Feather size={15} className="text-gray-400" />}
            label="Peer Review Guidelines"
          />
        </div>
      </div>
    </div>
  );
};
