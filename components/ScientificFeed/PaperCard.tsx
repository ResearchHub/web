'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { FeedCardBase } from './FeedCardBase';
import { PaperCard as PaperCardType } from '@/data/mockFeedData';
import { cn } from '@/utils/styles';
import { TrendingUp } from 'lucide-react';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface PaperCardProps {
  paper: PaperCardType;
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

export function PaperCard({ paper }: PaperCardProps) {
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const sourceLogo = getSourceLogo(paper.source);

  const formatAuthors = (authors: PaperCardType['authors']) => {
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
      upvotes={paper.upvotes}
      downvotes={paper.downvotes}
      comments={paper.comments}
      bookmarked={paper.bookmarked}
    >
      {/* Badges Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <ContentTypeBadge type="paper" size="lg" showTooltip={false} />
          <Badge variant="default" size="lg">
            {paper.category}
          </Badge>
          {paper.subcategory && (
            <span className="text-sm text-gray-900 ml-1">{paper.subcategory}</span>
          )}
        </div>
        {paper.trendingScore && (
          <div className="flex items-center gap-1">
            <span className="text-base">🔥</span>
            <span className="text-sm font-semibold text-orange-600">{paper.trendingScore}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Left Column */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">{paper.title}</h3>

          {/* Authors & Date & Source */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm text-gray-800">{formatAuthors(paper.authors)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{paper.createdDate}</span>
            {sourceLogo && (
              <>
                <span className="text-gray-400">•</span>
                <Image
                  src={sourceLogo}
                  alt={paper.source}
                  width={50}
                  height={40}
                  className="object-contain"
                  style={{ maxHeight: '17px' }}
                />
              </>
            )}
            {paper.peerReviewScore && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-yellow-600">
                    ⭐ {paper.peerReviewScore}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Abstract */}
          <div className="text-sm text-gray-600 leading-relaxed">
            {showFullAbstract ? paper.abstract : truncateAbstract(paper.abstract)}
            {paper.abstract.length > 250 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
              >
                {showFullAbstract ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Thumbnails */}
        {paper.thumbnails.length > 0 && (
          <div className="flex-shrink-0 w-32 h-32">
            <div className="grid grid-cols-2 gap-1 h-full">
              {paper.thumbnails.slice(0, 4).map((thumb, idx) => (
                <div key={idx} className="relative overflow-hidden rounded bg-gray-100">
                  <Image
                    src={thumb}
                    alt={`Figure ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeedCardBase>
  );
}
