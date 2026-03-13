'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { ApplicationFundraise } from '@/types/funding';
import { AuthorProfile } from '@/types/authorProfile';

interface FeedItemGrantWithProposalsProps {
  entry: FeedEntry;
  className?: string;
}

const VISIBLE_PROPOSALS = 3;

function formatCompact(amount: number, showUSD: boolean, exchangeRate: number): string {
  return formatCurrency({ amount, showUSD, exchangeRate, skipConversion: true, shorten: true });
}

interface ProposalRowProps {
  profile: AuthorProfile;
  fundraise: ApplicationFundraise;
  showUSD: boolean;
  exchangeRate: number;
  isLast: boolean;
}

const ProposalRow: FC<ProposalRowProps> = ({
  profile,
  fundraise,
  showUSD,
  exchangeRate,
  isLast,
}) => {
  const askAmount = showUSD
    ? Math.round(fundraise.goalAmount.usd)
    : Math.round(fundraise.goalAmount.rsc);

  const backerItems = fundraise.contributors.top.map((c) => ({
    src: '',
    alt: c.fullName,
    tooltip: c.fullName,
  }));

  return (
    <div
      className={cn(
        'grid items-center gap-3 px-5 py-2.5 hover:bg-gray-50/80 transition-colors cursor-pointer',
        !isLast && 'border-b border-gray-100'
      )}
      style={{ gridTemplateColumns: '58px 1fr auto' }}
    >
      {/* Ask amount */}
      <div className="text-center py-1 px-0.5 rounded-lg bg-gray-50 border border-gray-200/80">
        <div className="text-sm font-extrabold font-mono tracking-tight text-gray-900">
          {formatCompact(askAmount, showUSD, exchangeRate)}
        </div>
        <div className="text-[8.5px] font-bold uppercase text-gray-400 tracking-wide">ask</div>
      </div>

      {/* Title + author */}
      <div className="min-w-0">
        <p className="text-[12.5px] font-bold text-gray-900 truncate leading-snug mb-0.5">
          {fundraise.title || profile.fullName}
        </p>
        <div className="flex items-center gap-1.5">
          <Avatar src={profile.profileImage || ''} alt={profile.fullName} size="xxs" />
          <span className="text-[11px] text-gray-500 truncate">{profile.fullName}</span>
        </div>
      </div>

      {/* Backer avatars */}
      <div className="flex-shrink-0 min-w-[80px] flex justify-end">
        {backerItems.length > 0 ? (
          <AvatarStack
            items={backerItems}
            size="xs"
            maxItems={4}
            spacing={-8}
            showLabel={false}
            showExtraCount={true}
            totalItemsCount={fundraise.contributors.total}
          />
        ) : (
          <span className="text-[10.5px] text-gray-500 whitespace-nowrap">No backers yet</span>
        )}
      </div>
    </div>
  );
};

export const FeedItemGrantWithProposals: FC<FeedItemGrantWithProposalsProps> = ({
  entry,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [expanded, setExpanded] = useState(false);

  const content = entry.content as FeedGrantContent;
  const grant = content.grant;

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

  const totalRequested = allProposals.reduce((sum, a) => {
    const ask = showUSD ? (a.fundraise?.goalAmount.usd ?? 0) : (a.fundraise?.goalAmount.rsc ?? 0);
    return sum + ask;
  }, 0);

  return (
    <div
      className={cn(
        'bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Frosted header */}
      <Link href={href} className="block relative h-[120px] overflow-hidden bg-gray-900">
        {content.previewImage ? (
          <Image
            src={content.previewImage}
            alt={content.title}
            fill
            className="object-cover"
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

        {/* Frosted metadata bar */}
        <div
          className="absolute bottom-0 inset-x-0 flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06]"
          style={{
            backdropFilter: 'blur(16px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-white/40 mb-0.5">
              {grant.organization || content.organization || 'ResearchHub Grant'}
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">
              {grant.shortTitle || content.title}
            </div>
          </div>
          <div className="flex gap-5">
            {[
              {
                label: 'Funding',
                value: formatCompact(budgetAmount, showUSD, exchangeRate),
                accent: true,
              },
              { label: 'Proposals', value: String(allProposals.length), accent: false },
              { label: 'Duration', value: grant.endDate ? 'Fixed' : 'Rolling', accent: false },
            ].map((stat) => (
              <div key={stat.label} className="text-right">
                <div className="text-[8px] uppercase tracking-wider font-semibold text-white/[0.38]">
                  {stat.label}
                </div>
                <div
                  className={cn(
                    'font-extrabold font-mono',
                    stat.accent ? 'text-base text-emerald-300' : 'text-base text-white/80'
                  )}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Section label */}
      <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Applicant Proposals
        </span>
      </div>

      {/* Proposal rows or empty state */}
      {hasProposals ? (
        <div>
          {shown.map(({ profile, fundraise }, i) => (
            <ProposalRow
              key={profile.id ?? fundraise!.id}
              profile={profile}
              fundraise={fundraise!}
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
      ) : (
        <div className="px-5 py-8 text-center">
          <div className="text-[28px] mb-2 grayscale-[0.3]">📋</div>
          <div className="text-sm font-bold text-gray-900 mb-1">No proposals yet</div>
          <div className="text-xs text-gray-400 max-w-[280px] mx-auto leading-relaxed">
            Be the first to submit a research proposal for this grant.
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">
          {hasProposals
            ? `${allProposals.length} proposal${allProposals.length !== 1 ? 's' : ''} · ${formatCompact(Math.round(totalRequested), showUSD, exchangeRate)} total requested`
            : 'Rolling funding · Apply anytime'}
        </span>
        <Link href={href}>
          <Button variant="dark" size="sm" className="gap-1">
            {hasProposals ? 'Learn More' : 'Apply'}
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
