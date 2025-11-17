'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FeedCardBase } from './FeedCardBase';
import { PaperCard as PaperCardType } from '@/data/mockFeedData';
import { ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import { ImpactScoreTooltip } from '@/components/tooltips/ImpactScoreTooltip';

interface PaperCardProps {
  paper: PaperCardType;
  showHeroImage?: boolean;
  showCategoryAboveTitle?: boolean;
  categoryBadgeStyle?: 'badge' | 'text';
  imageLayout?: 'above-title' | 'right-column' | 'below-title';
  showUpvoteButton?: boolean;
  showTrendingScoreInActionBar?: boolean;
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

export function PaperCard({
  paper,
  showHeroImage = true,
  showCategoryAboveTitle = true,
  categoryBadgeStyle = 'badge',
  imageLayout = 'above-title',
  showUpvoteButton = false,
  showTrendingScoreInActionBar = false,
}: PaperCardProps) {
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
      comments={paper.comments}
      bookmarked={paper.bookmarked}
      peerReviewScore={paper.peerReviewScore}
      trendingScore={
        showCategoryAboveTitle || !showTrendingScoreInActionBar ? undefined : paper.trendingScore
      }
      trendingScoreTooltip={
        !showCategoryAboveTitle && showTrendingScoreInActionBar && paper.trendingScore ? (
          <ImpactScoreTooltip
            impactScore={paper.trendingScore}
            citations={142}
            twitterMentions={87}
            newsMentions={12}
            altmetricScore={345}
            peerReviewAverage={paper.peerReviewAverage}
            peerReviewCount={paper.peerReviewCount}
            upvotes={paper.upvotes}
            comments={paper.comments}
          />
        ) : undefined
      }
      upvotes={paper.upvotes}
      showUpvoteButton={showUpvoteButton && !showTrendingScoreInActionBar}
      // engagedUsers={paper.engagedUsers}
    >
      {/* Hero Image - Above Title Layout */}
      {showHeroImage && paper.heroImage && imageLayout === 'above-title' && (
        <div className="flex justify-center mb-4">
          <div className="relative w-[400px] h-[220px] rounded-lg overflow-hidden bg-white border border-gray-200">
            <Image
              src={paper.heroImage}
              alt={paper.title}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category Badge and Trending Score Row */}
        {showCategoryAboveTitle && (paper.subcategory || paper.trendingScore || sourceLogo) && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {paper.subcategory && (
                <div>
                  {categoryBadgeStyle === 'badge' ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                      {paper.subcategory}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-primary-600">
                      {paper.subcategory}
                    </span>
                  )}
                </div>
              )}
              {sourceLogo && (
                <div className="inline-flex items-center px-2 py-2 h-[26px] bg-white border border-gray-200 rounded-full">
                  <Image
                    src={sourceLogo}
                    alt={paper.source}
                    width={50}
                    height={40}
                    className="object-contain"
                    style={{ maxHeight: '17px' }}
                  />
                </div>
              )}
            </div>
            {paper.trendingScore && (
              <Tooltip
                content={
                  <ImpactScoreTooltip
                    impactScore={paper.trendingScore}
                    citations={142}
                    twitterMentions={87}
                    newsMentions={12}
                    altmetricScore={345}
                    peerReviewAverage={paper.peerReviewAverage}
                    peerReviewCount={paper.peerReviewCount}
                    upvotes={paper.upvotes}
                    comments={paper.comments}
                  />
                }
                width="w-72"
                position="top"
              >
                <div className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 cursor-help transition-colors">
                  <FontAwesomeIcon icon={faFlask} className="w-4 h-4" />
                  <span className="text-sm font-medium">{paper.trendingScore}</span>
                </div>
              </Tooltip>
            )}
          </div>
        )}

        {/* Right Column Layout */}
        {imageLayout === 'right-column' ? (
          <>
            {/* Title - Full Width */}
            <div className="mb-1">
              <h3 className="text-xl font-semibold text-gray-900 leading-snug">{paper.title}</h3>
            </div>

            {/* Content with Image on Right */}
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                {/* Authors & Date */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-sm text-gray-600">{formatAuthors(paper.authors)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{paper.createdDate}</span>
                </div>

                {/* Abstract */}
                <div className="text-sm text-gray-800 leading-relaxed">
                  {showFullAbstract ? paper.abstract : truncateAbstract(paper.abstract)}
                </div>
                {paper.abstract.length > 250 && (
                  <button
                    onClick={() => setShowFullAbstract(!showFullAbstract)}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
                  >
                    {showFullAbstract ? 'Show less' : 'Read more'}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        showFullAbstract && 'rotate-180'
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Thumbnail Image on Right - Square */}
              {showHeroImage && paper.heroImage && (
                <div className="flex-shrink-0 w-[200px] h-[140px] rounded-xl border border-4 border-gray-100 p-3">
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    <Image
                      src={paper.heroImage}
                      alt={paper.title}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Title */}
            <div className="mb-1">
              <h3 className="text-xl font-semibold text-gray-900 leading-snug">{paper.title}</h3>
            </div>

            {/* Authors & Date & Source & Badge */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-sm text-gray-600">{formatAuthors(paper.authors)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{paper.createdDate}</span>
              {!showCategoryAboveTitle && sourceLogo && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="inline-flex items-center px-2 py-2 bg-white border border-gray-200 rounded-full">
                    <Image
                      src={sourceLogo}
                      alt={paper.source}
                      width={50}
                      height={40}
                      className="object-contain"
                      style={{ maxHeight: '17px' }}
                    />
                  </div>
                </>
              )}
              {!showCategoryAboveTitle && paper.subcategory && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm font-medium text-primary-600">{paper.subcategory}</span>
                </>
              )}
            </div>

            {/* Hero Image - Below Title Layout */}
            {showHeroImage && paper.heroImage && imageLayout === 'below-title' && (
              <div className="mb-3">
                <div className="relative w-full h-[280px] rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={paper.heroImage}
                    alt={paper.title}
                    fill
                    className="object-cover"
                    sizes="700px"
                  />
                </div>
              </div>
            )}

            {/* Abstract */}
            <div className="text-sm text-gray-800 leading-relaxed">
              {showFullAbstract ? paper.abstract : truncateAbstract(paper.abstract)}
            </div>
            {paper.abstract.length > 250 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
              >
                {showFullAbstract ? 'Show less' : 'Read more'}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    showFullAbstract && 'rotate-180'
                  )}
                />
              </button>
            )}
          </>
        )}
      </div>
    </FeedCardBase>
  );
}
