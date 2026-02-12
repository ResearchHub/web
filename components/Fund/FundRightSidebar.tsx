'use client';

import React, { useEffect } from 'react';
import {
  BookCheck,
  Feather,
  ChevronRight,
  FileText,
  Lightbulb,
  Users,
  Banknote,
} from 'lucide-react';
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
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step = ({ icon, title, description, isLast = false }: StepProps) => (
  <div className="flex gap-3">
    {/* Icon column with connector line */}
    <div className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-200 my-1.5" />}
    </div>
    {/* Text column */}
    <div className={isLast ? 'pb-0' : 'pb-4'}>
      <p className="text-sm font-medium text-gray-900 leading-snug">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
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
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

const SectionHeader = ({ icon, title, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
    {action}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────
export const FundRightSidebar = () => {
  const { data, isLoading, error, fetchData } = useLeaderboard();
  const { showUSD } = useCurrencyPreference();
  const funders = data?.funders || [];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white rounded-xl border-gray-200 divide-y divide-gray-200 overflow-hidden">
      {/* ── How Funding Works ───────────────────────────────────── */}
      <div className="p-5">
        <SectionHeader
          icon={<span className="text-lg">⚡</span>}
          title="How Funding Works"
          action={
            <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
              ~2 weeks
            </span>
          }
        />

        <div className="mt-1">
          <Step
            icon={<FileText size={16} className="text-orange-400" />}
            title="Post Opportunity"
            description="Funders set clear goals"
          />
          <Step
            icon={<Lightbulb size={16} className="text-orange-400" />}
            title="Pitch Your Idea"
            description="Submit a proposal"
          />
          <Step
            icon={<Users size={16} className="text-orange-400" />}
            title="Community Validates"
            description="Experts review proposals"
          />
          <Step
            icon={<Banknote size={16} className="text-orange-400" />}
            title="Get Funded"
            description="Receive funds directly"
            isLast
          />
        </div>
      </div>

      {/* ── Top Funders ─────────────────────────────────────────── */}
      <div className="p-5">
        <SectionHeader
          icon={<span className="text-lg">🏆</span>}
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
        <SectionHeader icon={<span className="text-lg">📚</span>} title="Resources" />

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
