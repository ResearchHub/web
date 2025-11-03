'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { FeedCardBase } from './FeedCardBase';
import { BountyCard as BountyCardType } from '@/data/mockFeedData';
import { Button } from '@/components/ui/Button';
import { TrendingUp } from 'lucide-react';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface BountyCardProps {
  bounty: BountyCardType;
}

const getSourceLogo = (source: string) => {
  const sourceLower = source.toLowerCase();
  switch (sourceLower) {
    case 'arxiv':
      return '/logos/arxiv.png';
    case 'biorxiv':
      return '/logos/biorxiv.png';
    case 'chemrxiv':
      return '/logos/chemrxiv.png';
    case 'medrxiv':
      return '/logos/medrxiv.jpg';
    default:
      return null;
  }
};

export function BountyCard({ bounty }: BountyCardProps) {
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const sourceLogo = getSourceLogo(bounty.paper.source);

  const formatAuthors = (authors: BountyCardType['paper']['authors']) => {
    if (authors.length === 0) return '';
    if (authors.length === 1) return `${authors[0].firstName} ${authors[0].lastName}`;
    if (authors.length === 2)
      return `${authors[0].firstName} ${authors[0].lastName}, ${authors[1].firstName} ${authors[1].lastName}`;
    if (authors.length === 3)
      return `${authors[0].firstName} ${authors[0].lastName}, ${authors[1].firstName} ${authors[1].lastName} … ${authors[2].firstName} ${authors[2].lastName}`;

    const first = authors[0];
    const second = authors[1];
    const third = authors[2];
    return `${first.firstName} ${first.lastName}, ${second.firstName} ${second.lastName} … ${third.firstName} ${third.lastName}`;
  };

  const truncateAbstract = (text: string, maxLength = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const statusColors = {
    open: 'bg-green-100 text-green-800 border-green-200',
    'in-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <FeedCardBase
      upvotes={bounty.upvotes}
      downvotes={bounty.downvotes}
      comments={bounty.comments}
      bookmarked={bounty.bookmarked}
    >
      {/* Badges Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <ContentTypeBadge type="bounty" size="lg" showTooltip={false} />
          <Badge variant="default" size="lg">
            {bounty.category}
          </Badge>
          {bounty.subcategory && (
            <span className="text-sm text-gray-900 ml-1">{bounty.subcategory}</span>
          )}
        </div>
        {bounty.trendingScore && (
          <div className="flex items-center gap-1">
            <span className="text-base">🔥</span>
            <span className="text-sm font-semibold text-orange-600">{bounty.trendingScore}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Left Column */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
            {bounty.paper.title}
          </h3>

          {/* Authors & Date & Source */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm text-gray-800">{formatAuthors(bounty.paper.authors)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{bounty.createdDate}</span>
            {sourceLogo && (
              <>
                <span className="text-gray-400">•</span>
                <Image
                  src={sourceLogo}
                  alt={bounty.paper.source}
                  width={50}
                  height={40}
                  className="object-contain"
                  style={{ maxHeight: '17px' }}
                />
              </>
            )}
          </div>

          {/* Abstract */}
          <div className="text-sm text-gray-600 leading-relaxed">
            {showFullAbstract ? bounty.paper.abstract : truncateAbstract(bounty.paper.abstract)}
            {bounty.paper.abstract.length > 250 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
              >
                {showFullAbstract ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Thumbnails (if paper has them) */}
        {/* For now, bounty papers don't have thumbnails in mock data, but structure is here if needed */}
      </div>

      {/* Peer Review Bounty Callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              Peer Review Bounty for ${bounty.bountyAmount.toLocaleString()}
            </span>
            <Badge className={statusColors[bounty.status]}>
              {bounty.status === 'in-review'
                ? 'In Review'
                : bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
            </Badge>
            {bounty.reviewers.length > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <AvatarStack
                    items={bounty.reviewers.map((r) => ({
                      src: r.avatar,
                      alt: r.name,
                      tooltip: r.name,
                    }))}
                    size="xs"
                    maxItems={5}
                    showExtraCount
                    spacing={-6}
                  />
                  <span className="text-xs text-gray-600">
                    {bounty.reviewers.length}{' '}
                    {bounty.reviewers.length === 1 ? 'reviewer' : 'reviewers'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Button size="md" variant="outlined">
              Details
            </Button>
            <Button size="md" variant="default">
              Review
            </Button>
          </div>
        </div>
      </div>
    </FeedCardBase>
  );
}
