'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Badge } from '@/components/ui/Badge';
import { buildWorkUrl } from '@/utils/url';

interface ProposalCardProps {
  readonly entry: FeedEntry;
  readonly userContribution?: number;
}

export const ProposalCard: FC<ProposalCardProps> = ({ entry, userContribution }) => {
  const content = entry.content as FeedPostContent;

  const href = buildWorkUrl({
    id: content.id,
    slug: content.slug,
    contentType: 'preregistration',
  });

  const title = content.title || 'Untitled Proposal';
  const leadAuthor = content.authors?.[0];
  const topics = content.topics || [];
  const fundraise = content.fundraise;

  // Calculate funding progress
  const raised = fundraise?.amountRaised?.usd || 0;
  const goal = fundraise?.goalAmount?.usd || 0;
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  // Get status info
  const isOpen = fundraise?.status === 'OPEN';
  const isSteady = progress >= 50; // "High momentum" or "Steady" badge

  // Placeholder for new updates count - would come from API
  const newUpdates = entry.metrics?.comments || 0;

  // Stats
  const updateCount = 0; // Would come from API
  const commentCount = entry.metrics?.comments || 0;
  const reviewCount = 0; // Would come from API

  // Latest update text - would come from API
  const latestUpdate = content.textPreview ? content.textPreview.slice(0, 100) + '...' : null;

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{title}</h3>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          </div>
          {leadAuthor && <p className="text-gray-500 text-sm mt-1">Lead: {leadAuthor.fullName}</p>}
        </div>
        {newUpdates > 0 && (
          <Badge variant="default" className="bg-blue-50 text-blue-600 border-0 text-xs shrink-0">
            {newUpdates} new
          </Badge>
        )}
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isSteady && (
          <Badge variant="default" className="bg-orange-100 text-orange-700 border-0 text-xs">
            {progress >= 75 ? 'High momentum' : 'Steady'}
          </Badge>
        )}
        {topics.slice(0, 2).map((topic, index) => (
          <Badge
            key={topic.id || index}
            variant="default"
            className="bg-gray-100 text-gray-700 border-0 text-xs"
          >
            {topic.name}
          </Badge>
        ))}
      </div>

      {/* Funding progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <div>
            <span className="text-orange-600 font-semibold">${formatNumber(raised)}</span>
            <span className="text-gray-500 ml-1">raised</span>
          </div>
          <div>
            <span className="text-gray-700 font-semibold">${formatNumber(goal)}</span>
            <span className="text-gray-500 ml-1">goal</span>
          </div>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        {updateCount > 0 && <span>{updateCount} updates</span>}
        {commentCount > 0 && <span>{commentCount} comments</span>}
        {reviewCount > 0 && <span>{reviewCount} reviews</span>}
        {updateCount === 0 && commentCount === 0 && reviewCount === 0 && (
          <span>No activity yet</span>
        )}
      </div>

      {/* Latest update */}
      {latestUpdate && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          <span className="text-gray-500">Latest:</span> {latestUpdate}
        </p>
      )}

      {/* User contribution */}
      {userContribution && userContribution > 0 && (
        <p className="text-sm">
          <span className="text-gray-500">You contributed</span>{' '}
          <span className="text-orange-600 font-semibold">${formatNumber(userContribution)}</span>
        </p>
      )}
    </Link>
  );
};

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
