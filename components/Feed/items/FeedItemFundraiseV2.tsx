'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgo } from '@/utils/date';

interface FeedItemFundraiseV2Props {
  entry: FeedEntry;
  className?: string;
}

function formatCompact(amount: number, showUSD: boolean, exchangeRate: number): string {
  return formatCurrency({ amount, showUSD, exchangeRate, skipConversion: true, shorten: true });
}

export const FeedItemFundraiseV2: FC<FeedItemFundraiseV2Props> = ({ entry, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const post = entry.content as FeedPostContent;
  const fundraise = post.fundraise;
  const primaryAuthor = post.authors?.[0];
  const organization = entry.nonprofit?.name || post.institution;

  const href = buildWorkUrl({
    id: post.id,
    slug: post.slug,
    contentType: 'preregistration',
  });

  const imageUrl = post.previewImage;
  const timeAgo = formatTimeAgo(entry.timestamp);

  const askAmount = fundraise
    ? showUSD
      ? Math.round(fundraise.goalAmount.usd)
      : Math.round(fundraise.goalAmount.rsc)
    : 0;

  const raisedAmount = fundraise
    ? showUSD
      ? Math.round(fundraise.amountRaised.usd)
      : Math.round(fundraise.amountRaised.rsc)
    : 0;

  const numBackers = fundraise?.contributors?.numContributors ?? 0;

  const backerItems =
    fundraise?.contributors?.topContributors?.map((c) => ({
      src: c.authorProfile.profileImage || '',
      alt: c.authorProfile.fullName,
      tooltip: c.authorProfile.fullName,
      authorId: c.authorProfile.id || undefined,
    })) || [];

  const stats = [
    {
      label: 'Ask',
      value: formatCompact(askAmount, showUSD, exchangeRate),
      accent: true,
    },
    {
      label: 'Raised',
      value: formatCompact(raisedAmount, showUSD, exchangeRate),
      accent: false,
    },
    {
      label: 'Backers',
      value: String(numBackers),
      accent: false,
    },
  ];

  return (
    <div
      className={cn(
        'bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Hero with frosted bar */}
      <Link href={href} className="block relative h-[120px] overflow-hidden bg-gray-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 660px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 40%, rgba(251,146,60,0.5) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.4) 0%, transparent 45%), ' +
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
        )}

        {/* Top-right badges */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
          {fundraise?.reviewMetrics && fundraise.reviewMetrics.avg > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/95 text-gray-900 border border-gray-200/80 px-2 py-0.5 rounded-full shadow-sm">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {fundraise.reviewMetrics.avg.toFixed(1)}
            </span>
          )}
          <span className="text-[10px] font-medium text-white/70 bg-black/30 rounded-full px-2 py-0.5 backdrop-blur-sm">
            {timeAgo}
          </span>
        </div>

        {/* Frosted metadata bar — primary hue tint */}
        <div
          className="absolute bottom-0 inset-x-0 flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06]"
          style={{
            backdropFilter: 'blur(16px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
            background: 'rgba(20, 40, 100, 0.6)',
          }}
        >
          {/* Author + org */}
          <div className="flex items-center gap-2.5 min-w-0">
            {primaryAuthor && (
              <Avatar
                src={primaryAuthor.profileImage || ''}
                alt={primaryAuthor.fullName}
                size="xs"
              />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {primaryAuthor?.fullName}
              </div>
              {organization && (
                <div className="text-[9px] font-medium text-white/40 truncate">{organization}</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="text-right">
                <div className="text-[8px] uppercase tracking-wider font-semibold text-white/[0.38]">
                  {stat.label}
                </div>
                <div
                  className={cn(
                    'font-extrabold font-mono text-base',
                    stat.accent ? 'text-primary-300' : 'text-white/80'
                  )}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Title + backers row */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5">
        <Link href={href} className="min-w-0 hover:underline">
          <p className="text-[13.5px] font-semibold text-gray-900 line-clamp-2 leading-snug">
            {post.title}
          </p>
        </Link>

        <div className="flex-shrink-0 flex justify-end">
          {backerItems.length > 0 ? (
            <AvatarStack
              items={backerItems}
              size="xs"
              maxItems={3}
              spacing={-8}
              showLabel={false}
              showExtraCount={true}
              totalItemsCount={numBackers}
            />
          ) : (
            <span className="text-[10.5px] text-gray-400 whitespace-nowrap">No backers yet</span>
          )}
        </div>
      </div>

      {/* Footer with CTA */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">
          {raisedAmount > 0
            ? `${formatCompact(raisedAmount, showUSD, exchangeRate)} raised of ${formatCompact(askAmount, showUSD, exchangeRate)} goal`
            : 'Seeking funding · Contribute now'}
        </span>
        <Link href={href}>
          <Button variant="dark" size="sm" className="gap-1">
            Fund Proposal
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
