'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Badge } from '@/components/ui/Badge';
import { buildWorkUrl } from '@/utils/url';
import { formatNumber } from '@/utils/number';
import { ApiClient } from '@/services/client';
import { CARD_STYLES } from './lib/shared';

const PREVIEW_MAX_LENGTH = 100;

interface ProposalCardProps {
  readonly entry: FeedEntry;
}

export function ProposalCard({ entry }: ProposalCardProps) {
  const content = entry.content as FeedPostContent;
  const { fundraise, topics = [] } = content;
  const raised = fundraise?.amountRaised?.usd ?? 0;
  const goal = fundraise?.goalAmount?.usd ?? 0;
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const comments = entry.metrics?.comments ?? 0;

  const [isStarred, setIsStarred] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newStarred = !isStarred;
    setIsStarred(newStarred); // Optimistic update
    setIsToggling(true);

    try {
      await ApiClient.post('/api/fundraise/funding_star/', {
        fundraise_id: fundraise?.id,
        starred: newStarred,
      });
    } catch (error) {
      console.error('Failed to toggle star:', error);
      setIsStarred(!newStarred); // Revert on error
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link
      href={buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'preregistration' })}
      className={CARD_STYLES}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {content.title || 'Untitled'}
            </h3>
            <button
              type="button"
              onClick={handleStarClick}
              disabled={isToggling}
              className="shrink-0 p-0.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label={isStarred ? 'Unstar proposal' : 'Star proposal'}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 fill-transparent'
                }`}
              />
            </button>
          </div>
          {content.authors?.[0] && (
            <p className="text-gray-500 text-sm mt-1">Lead: {content.authors[0].fullName}</p>
          )}
        </div>
        {comments > 0 && (
          <Badge variant="default" className="bg-blue-50 text-blue-600 border-0 text-xs shrink-0">
            {comments} new
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {progress >= 50 && (
          <Badge variant="default" className="bg-orange-100 text-orange-700 border-0 text-xs">
            {progress >= 75 ? 'High momentum' : 'Steady'}
          </Badge>
        )}
        {topics.slice(0, 2).map((t, i) => (
          <Badge
            key={t.id ?? i}
            variant="default"
            className="bg-gray-100 text-gray-700 border-0 text-xs"
          >
            {t.name}
          </Badge>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>
            <span className="text-orange-600 font-semibold">${formatNumber(raised)}</span>{' '}
            <span className="text-gray-500">raised</span>
          </span>
          <span>
            <span className="text-gray-700 font-semibold">${formatNumber(goal)}</span>{' '}
            <span className="text-gray-500">goal</span>
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {comments > 0 ? `${comments} comments` : 'No activity yet'}
      </p>
      {content.textPreview && (
        <p className="text-sm text-gray-600 line-clamp-2">
          <span className="text-gray-500">Latest:</span>{' '}
          {content.textPreview.slice(0, PREVIEW_MAX_LENGTH)}...
        </p>
      )}
    </Link>
  );
}
