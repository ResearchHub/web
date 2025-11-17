'use client';

import React from 'react';
import { Quote, Newspaper, BarChart3, Star, ArrowUp, MessageCircle } from 'lucide-react';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ImpactScoreTooltipProps {
  impactScore: number;
  citations: number;
  twitterMentions: number;
  newsMentions: number;
  altmetricScore?: number | null;
  peerReviewAverage?: number;
  peerReviewCount?: number;
  upvotes?: number;
  comments?: number;
}

const formatNumber = (num: number | null) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export function ImpactScoreTooltip({
  impactScore,
  citations,
  twitterMentions,
  newsMentions,
  altmetricScore,
  peerReviewAverage,
  peerReviewCount,
  upvotes,
  comments,
}: ImpactScoreTooltipProps) {
  return (
    <div className="space-y-3">
      {/* Impact Score with Circular Progress */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#22c55e"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - impactScore / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-semibold text-gray-900">{Math.round(impactScore)}</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Trending Score</h4>
          <p className="text-sm text-gray-600">Top {100 - Math.round(impactScore)}% of papers</p>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-2 border-t border-gray-200 pt-3">
        {peerReviewAverage !== undefined && peerReviewCount !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Peer Reviews</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {peerReviewAverage.toFixed(1)}/5 ({peerReviewCount} {peerReviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
        {upvotes !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Upvotes</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatNumber(upvotes)}</span>
          </div>
        )}
        {comments !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Comments</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatNumber(comments)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Citations</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatNumber(citations)}</span>
        </div>
        {twitterMentions > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">X Posts</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(twitterMentions)}
            </span>
          </div>
        )}
        {newsMentions > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">News Mentions</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(newsMentions)}
            </span>
          </div>
        )}
      </div>

      {/* Explanatory text */}
      <p className="text-xs text-gray-600 italic border-t border-gray-200 pt-3">
        The impact score is calculated based on multiple factors including citations, social media
        engagement, and news coverage.
      </p>
    </div>
  );
}
