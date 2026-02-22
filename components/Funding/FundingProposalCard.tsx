'use client';

import { FC, useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Avatar } from '@/components/ui/Avatar';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { Button } from '@/components/ui/Button';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { cn } from '@/utils/styles';
import { FundraiseProgressBar } from './FundraiseProgressBar';
import { differenceInDays } from 'date-fns';

const HOVER_DELAY = 100;
const EXPAND_PX = 24;

interface FundingProposalCardProps {
  entry: FeedEntry;
  className?: string;
  showActions?: boolean;
}

export const FundingProposalCard: FC<FundingProposalCardProps> = ({
  entry,
  className,
  showActions = true,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const showOverlay = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOverlayStyle({
        position: 'fixed',
        top: rect.top - EXPAND_PX,
        left: rect.left - EXPAND_PX,
        width: rect.width + EXPAND_PX * 2,
        zIndex: 9999,
      });
      setVisible(true);
    }, HOVER_DELAY);
  }, []);

  const hideOverlay = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setVisible(false);
  }, []);

  const content = entry.content as FeedPostContent;
  const fundraise = content.fundraise;

  if (!fundraise) return null;

  const isCompleted = fundraise.status === 'COMPLETED' || fundraise.status === 'CLOSED';
  const author = fundraise.createdBy?.authorProfile;
  const href = `/fund/${content.id}/${content.slug}`;

  const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
  const raisedAmount = showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc;

  const daysRemaining = fundraise.endDate
    ? differenceInDays(new Date(fundraise.endDate), new Date())
    : null;
  const isEndingSoon =
    !isCompleted && daysRemaining !== null && daysRemaining <= 14 && daysRemaining >= 0;

  const statusBadge = isCompleted ? (
    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Fully funded
    </div>
  ) : isEndingSoon ? (
    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
      Ending soon
    </div>
  ) : null;

  const imageBlock = (aspectClass: string) => (
    <div
      className={cn(
        'relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-100',
        aspectClass
      )}
    >
      {content.previewImage ? (
        <Image
          src={content.previewImage}
          alt={content.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-400 text-3xl font-mono">$</span>
        </div>
      )}
      {statusBadge}
    </div>
  );

  const fundingRow = (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 min-w-0">
        <FundraiseProgressBar
          raisedAmount={raisedAmount}
          goalAmount={goalAmount}
          isCompleted={isCompleted}
        />
      </div>
      <div className="flex-shrink-0 flex items-baseline gap-1 text-xs font-mono">
        <span className="font-bold text-gray-900">
          {formatCurrency({
            amount: raisedAmount,
            showUSD,
            exchangeRate,
            shorten: true,
            skipConversion: true,
          })}
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">
          {formatCurrency({
            amount: goalAmount,
            showUSD,
            exchangeRate,
            shorten: true,
            skipConversion: true,
          })}
        </span>
      </div>
    </div>
  );

  return (
    <div ref={cardRef} onMouseEnter={showOverlay} onMouseLeave={hideOverlay}>
      <Link
        href={href}
        className={cn(
          'relative block rounded-xl flex flex-col',
          isCompleted && 'opacity-75',
          className
        )}
      >
        <div className="relative">
          {imageBlock('aspect-[16/9]')}

          <div className="pt-2 pb-1 flex-1 flex gap-2">
            <div className="flex-shrink-0 pt-0.5">
              <Avatar src={author?.profileImage} alt={author?.fullName || 'Author'} size={24} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-3 mb-0.5">
                {content.title}
              </h3>
              <span className="text-xs text-gray-500 truncate">{author?.fullName}</span>
              <div className="flex-1" />
              {fundingRow}
            </div>
          </div>

          {showActions && (
            <div
              className="py-1.5 border-t border-gray-100 cursor-default"
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType={entry.contentType}
                votableEntityId={content.id}
                relatedDocumentId={content.id.toString()}
                relatedDocumentContentType="post"
                userVote={entry.userVote}
                href={href}
                hideCommentButton={true}
                hideReportButton={true}
                showPeerReviews={true}
                relatedDocumentUnifiedDocumentId={content.unifiedDocumentId}
              />
            </div>
          )}
        </div>
      </Link>

      {/* Expanded overlay */}
      {visible && (
        <div
          style={overlayStyle}
          onMouseEnter={() => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            setVisible(true);
          }}
          onMouseLeave={hideOverlay}
        >
          <div
            className={cn(
              'rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden',
              isCompleted && 'opacity-90'
            )}
          >
            <Link href={href}>
              {imageBlock('aspect-[16/8]')}

              <div className="p-3">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 pt-0.5">
                    <Avatar
                      src={author?.profileImage}
                      alt={author?.fullName || 'Author'}
                      size={28}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5">
                      {content.title}
                    </h3>
                    <span className="text-xs text-gray-500">{author?.fullName}</span>
                  </div>
                </div>
                {fundingRow}
              </div>
            </Link>

            <div className="px-3 pb-3">
              <Link href={href}>
                <Button size="sm" className="w-full gap-1.5">
                  Fund Proposal
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
