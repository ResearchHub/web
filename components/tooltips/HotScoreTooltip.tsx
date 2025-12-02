'use client';

import React from 'react';
import { Clock, ArrowUp, Coins, Star, MessageCircle, Eye } from 'lucide-react';
import { HotScoreBreakdown } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';

// Custom Github icon component
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

// Custom Bluesky icon component
const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);

// Wrapper for the custom Icon component to match the expected interface
const EarnIcon = ({ className }: { className?: string }) => (
  <Icon name="earn1" size={16} color="#9ca3af" className={className} />
);

interface PopularityScoreTooltipProps {
  score: number;
  breakdown?: HotScoreBreakdown;
}

// Signal configuration with display names and icons
// Keys must match the API response: recency, upvote, tip, peer_review, comment, bounty, github, bluesky, page_views
const SIGNAL_CONFIG: {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'recency', label: 'Recency', icon: Clock },
  { key: 'page_views', label: 'Page Views', icon: Eye },
  { key: 'upvote', label: 'Upvotes', icon: ArrowUp },
  { key: 'tip', label: 'Tips', icon: Coins },
  { key: 'peer_review', label: 'Peer Reviews', icon: Star },
  { key: 'comment', label: 'Comments', icon: MessageCircle },
  { key: 'bounty', label: 'Bounty', icon: EarnIcon },
  { key: 'github', label: 'Github', icon: GithubIcon },
  { key: 'bluesky', label: 'Bluesky', icon: BlueskyIcon },
];

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '0';
  if (num === 0) return '0';
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  // For small decimals (like recency), show 2 decimal places
  if (num > 0 && num < 1) {
    return num.toFixed(2);
  }
  return Math.round(num).toString();
};

export function PopularityScoreTooltip({ score, breakdown }: PopularityScoreTooltipProps) {
  const signals = breakdown?.signals || {};

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="space-y-3" onClick={handleClick}>
      {/* Popularity Score - Centered Large Number */}
      <div className="text-center py-2">
        <p className="text-sm text-gray-500 mb-1">Popularity Score</p>
        <span className="text-4xl font-bold text-blue-600">{Math.round(score)}</span>
      </div>

      {/* Explanatory text */}
      <p className="text-xs text-gray-600 italic border-t border-gray-200 pt-3">
        The popularity score is calculated based on multiple engagement signals including recency,
        views, votes, tips, and social activity.
      </p>

      {/* Signals List */}
      <div className="space-y-2 border-t border-gray-200 pt-3">
        {SIGNAL_CONFIG.map(({ key, label, icon: SignalIcon }) => {
          const signal = signals[key];
          const rawValue = signal?.raw ?? 0;

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SignalIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(rawValue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** @deprecated Use PopularityScoreTooltip instead */
export const HotScoreTooltip = PopularityScoreTooltip;
