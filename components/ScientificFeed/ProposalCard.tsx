'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Progress } from '@/components/ui/Progress';
import { FeedCardBase } from './FeedCardBase';
import { ProposalCard as ProposalCardType } from '@/data/mockFeedData';
import { Button } from '@/components/ui/Button';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface ProposalCardProps {
  proposal: ProposalCardType;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const percentFunded = Math.round((proposal.raised / proposal.goal) * 100);

  const formatAuthors = (authors: ProposalCardType['authors']) => {
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

  return (
    <FeedCardBase
      upvotes={proposal.upvotes}
      downvotes={proposal.downvotes}
      comments={proposal.comments}
      bookmarked={proposal.bookmarked}
    >
      {/* Badges Row */}
      <div className="flex items-center gap-3 mb-3">
        <ContentTypeBadge type="funding" size="lg" showTooltip={false} />
        <Badge variant="default" size="lg">
          {proposal.category}
        </Badge>
        {proposal.subcategory && (
          <span className="text-sm text-gray-900 ml-1">{proposal.subcategory}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Left Column */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
            {proposal.title}
          </h3>

          {/* Institution */}
          {proposal.institution && (
            <div className="text-sm text-gray-600 mb-2">{proposal.institution}</div>
          )}

          {/* Authors & Date */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm text-gray-800">{formatAuthors(proposal.authors)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{proposal.createdDate}</span>
          </div>

          {/* Abstract */}
          <div className="text-sm text-gray-600 leading-relaxed mb-4">
            {showFullAbstract ? proposal.abstract : truncateAbstract(proposal.abstract)}
            {proposal.abstract.length > 250 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
              >
                {showFullAbstract ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Thumbnail */}
        {proposal.thumbnail && (
          <div className="flex-shrink-0 w-32 h-32">
            <div className="relative w-full h-full overflow-hidden rounded bg-gray-100">
              <Image
                src={proposal.thumbnail}
                alt="Proposal thumbnail"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Fundraise Progress Callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Amount Raised</div>
            <div className="text-xl font-bold text-gray-900">
              ${proposal.raised.toLocaleString()} / ${proposal.goal.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Deadline</div>
            <div className="text-sm font-semibold text-gray-900">{proposal.endDate}</div>
          </div>
        </div>

        <Progress value={proposal.raised} max={proposal.goal} size="xs" className="mb-2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AvatarStack
              items={proposal.supporters.map((s) => ({
                src: s.avatar,
                alt: s.name,
                tooltip: s.name,
              }))}
              size="xs"
              maxItems={5}
              showExtraCount
              spacing={-6}
            />
            <span className="text-xs text-gray-700">
              {proposal.supporters.length}{' '}
              {proposal.supporters.length === 1 ? 'supporter' : 'supporters'}
            </span>
          </div>
          <Button size="md" variant="default">
            Fund
          </Button>
        </div>
      </div>
    </FeedCardBase>
  );
}
