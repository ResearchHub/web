'use client';

import { FC, useState } from 'react';
import { FundingRequest, FeedEntry, Content } from '@/types/feed';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, Gift, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { Journal } from '@/types/journal';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/Progress';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { FundResearchModal } from '@/components/modals/FundResearchModal';

interface FeedItemBodyProps {
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: FeedEntry['metrics'];
  hideTypeLabel?: boolean;
}

const buildUrl = (item: Content) => {
  const title = item.title || '';
  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
  return `/${item.type}/${item.id}/${slug}`;
};

export const FeedItemBody: FC<FeedItemBodyProps> = ({
  content,
  target,
  context,
  metrics,
  hideTypeLabel,
}) => {
  const router = useRouter();
  const [showFundModal, setShowFundModal] = useState(false);
  const [expandedPaperIds, setExpandedPaperIds] = useState<Set<string | number>>(new Set());
  const [expandedFundingRequests, setExpandedFundingRequests] = useState<Set<string | number>>(
    new Set()
  );

  const toggleExpanded = (id: string | number) => {
    setExpandedPaperIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFundingRequestExpanded = (id: string | number, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedFundingRequests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderItem = (item: Content, isTarget: boolean = false) => {
    const itemContent = (() => {
      switch (item.type) {
        case 'bounty':
          return renderBounty(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        case 'paper':
          return renderPaper(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        case 'post':
          return renderPost(item, expandedPaperIds.has(item.id), () => toggleExpanded(item.id));
        case 'funding_request':
          return renderFundingRequest(
            item as FundingRequest,
            expandedFundingRequests.has(item.id),
            (e) => toggleFundingRequestExpanded(item.id, e)
          );
        default:
          return null;
      }
    })();

    if (!itemContent) return null;

    const isCard =
      isTarget ||
      item.type === 'bounty' ||
      item.type === 'paper' ||
      item.type === 'post' ||
      item.type === 'funding_request';

    const renderCard = (children: React.ReactNode) => {
      if (!isCard) return children;

      const cardContent = (
        <div
          className={`border border-gray-200 rounded-lg ${
            item.type === 'funding_request'
              ? 'bg-gray-50 p-0 overflow-hidden'
              : 'bg-gray-50 hover:bg-gray-100 p-3'
          } transition-colors`}
        >
          {children}
        </div>
      );

      return isCard && item.type !== 'funding_request' ? (
        <Link href={buildUrl(item)}>{cardContent}</Link>
      ) : (
        cardContent
      );
    };

    return renderCard(
      <div className={item.type === 'funding_request' ? '' : 'p-0'}>{itemContent}</div>
    );
  };

  const renderBounty = (bounty: Content, isExpanded: boolean, onToggleExpand: () => void) => {
    if (bounty.paper) {
      return renderPaper(bounty.paper, isExpanded, onToggleExpand);
    }
    return <div>An amount of {bounty.amount} has been added to the bounty.</div>;
  };

  const renderPost = (post: Content, isExpanded: boolean, onToggleExpand: () => void) => {
    return renderExpandableContent(
      'post',
      post.title ?? '',
      post.summary || '',
      isExpanded,
      onToggleExpand
    );
  };

  const renderPaper = (paper: Content, isExpanded: boolean, onToggleExpand: () => void) => {
    return renderExpandableContent(
      'paper',
      paper.title ?? '',
      paper.abstract || '',
      isExpanded,
      onToggleExpand,
      paper.journal
    );
  };

  const renderFundingRequest = (
    fundingRequest: FundingRequest,
    isExpanded: boolean,
    onToggleExpand: (e: React.MouseEvent) => void
  ) => {
    const imageUrl = fundingRequest.image || '/Animated-Logo-v4.gif';
    const progressPercentage =
      fundingRequest.goalAmount > 0
        ? Math.min(100, (fundingRequest.amount / fundingRequest.goalAmount) * 100)
        : 0;

    const truncateSummary = (summary: string, limit: number = 180) => {
      if (!summary) return '';
      if (summary.length <= limit) return summary;
      return summary.slice(0, limit).trim() + '...';
    };

    const isSummaryTruncated = fundingRequest.abstract && fundingRequest.abstract.length > 180;

    // Format goal amount with RSC
    const goalAmountDisplay =
      formatRSC({ amount: fundingRequest.goalAmount || 0, shorten: true }) + ' RSC';

    // Format current amount
    const currentAmountDisplay = formatRSC({ amount: fundingRequest.amount || 0, shorten: true });

    return (
      <div className="flex overflow-hidden">
        {/* Content - Left Side */}
        <div className="flex-1 flex flex-col p-3 pr-4">
          {/* Type Label and Badges in a single row */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              Preregistration
            </div>

            {fundingRequest.offersMementos && (
              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-indigo-100 text-indigo-700">
                <Gift className="w-4 h-4" />
                NFT Reward
              </div>
            )}
            {fundingRequest.isTaxDeductible && (
              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Tax Deductible
              </div>
            )}
          </div>

          {/* Title - Using same format as other article types */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
            {fundingRequest.title}
          </h3>

          {/* Abstract - Using same format as other article types */}
          <div className="text-sm text-gray-800 mb-4 flex-grow">
            <p>
              {isExpanded
                ? fundingRequest.abstract
                : truncateSummary(fundingRequest.abstract || '')}
            </p>
            {isSummaryTruncated && (
              <Button
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleExpand(e);
                }}
                className="flex items-center gap-0.5 mt-1"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <ChevronDown
                  size={14}
                  className={cn(
                    'transition-transform duration-200',
                    isExpanded && 'transform rotate-180'
                  )}
                />
              </Button>
            )}
          </div>

          {/* Funding Progress and Contribute Button - Rearranged with button on left */}
          <div className="mt-auto flex items-center gap-4 pt-1 pb-0">
            {/* Contribute Button - Now on the left */}
            <Button
              variant="default"
              size="default"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 rounded-md"
              disabled={fundingRequest.status !== 'OPEN'}
              onClick={(e) => {
                e.preventDefault(); // Prevent link navigation
                setShowFundModal(true);
              }}
            >
              Contribute
            </Button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-2">
              <div className="w-1/3 max-w-[200px]">
                <Progress
                  value={progressPercentage}
                  className="bg-gray-200"
                  variant="default"
                  size="sm"
                />
              </div>

              {/* Funding Amount */}
              <div className="flex items-center">
                <span className="text-[15px] font-medium text-gray-900">
                  {currentAmountDisplay}
                </span>
                <span className="text-[15px] text-gray-900 mx-1">/</span>
                <span className="text-[15px] font-medium text-gray-900">{goalAmountDisplay}</span>
                <ResearchCoinIcon size={16} className="text-orange-500 ml-1.5 mr-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Image - Right Side - No padding, fills to edge with rounded corners */}
        <div className="relative w-1/4 min-w-[150px]">
          <Image
            src={imageUrl}
            alt={fundingRequest.title}
            fill
            className="object-cover rounded-r-lg"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>

        {/* Fund Research Modal */}
        {showFundModal && (
          <FundResearchModal
            isOpen={showFundModal}
            onClose={() => setShowFundModal(false)}
            title={fundingRequest.title}
            nftRewardsEnabled={fundingRequest.offersMementos || false}
            nftImageSrc={fundingRequest.image}
            fundraiseId={Number(fundingRequest.fundraiseId || fundingRequest.id)}
          />
        )}
      </div>
    );
  };

  const renderExpandableContent = (
    type: string,
    title: string,
    summary: string,
    isExpanded: boolean,
    onToggleExpand: () => void,
    journal?: Journal
  ) => {
    const truncateSummary = (summary: string, limit: number = 200) => {
      if (summary.length <= limit) return summary;
      return summary.slice(0, limit).trim() + '...';
    };

    const isSummaryTruncated = summary.length > 200;

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {type}
          </div>
          {journal && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-200 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/journal/${journal.slug}`);
              }}
            >
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={journal.imageUrl}
                  alt={journal.slug}
                  size="xxs"
                  className="ring-1 ring-gray-200"
                />
                <span className="text-gray-700">{journal.name}</span>
              </div>
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 hover:text-indigo-600">
          {title}
        </h3>
        <div className="text-sm text-gray-800">
          <p>{isExpanded ? summary : truncateSummary(summary)}</p>
          {isSummaryTruncated && (
            <Button
              variant="link"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleExpand();
              }}
              className="flex items-center gap-0.5 mt-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  isExpanded && 'transform rotate-180'
                )}
              />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderItem(content)}
      {target && renderItem(target, true)}
    </div>
  );
};
