'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import type { KeyInsightItem, KeyInsightItemType, ProposalReview } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface ReviewInsightsSectionProps {
  aiPeerReview: ProposalReview | null | undefined;
  reviewsUrl: string;
}

const SHORT_PREVIEW_CHARS = 60;

function shortPreview(text: string): string {
  const idx = text.indexOf(':');
  const head = (idx === -1 ? text : text.slice(0, idx)).trim();
  return head.length > SHORT_PREVIEW_CHARS
    ? `${head.slice(0, SHORT_PREVIEW_CHARS).trimEnd()}…`
    : head;
}

interface InsightRowProps {
  text: string;
  variant: 'pro' | 'con';
}

function firstKeyInsightTeaser(
  items: KeyInsightItem[] | undefined,
  itemType: KeyInsightItemType
): string | undefined {
  if (!items?.length) return undefined;
  const row = [...items]
    .filter((i) => i.itemType === itemType)
    .sort((a, b) => a.order - b.order || a.id - b.id)[0];
  if (!row) return undefined;
  return row.label ? `${row.label}: ${row.description}`.trim() : row.description;
}

const InsightRow: FC<InsightRowProps> = ({ text, variant }) => {
  const Icon = variant === 'pro' ? ArrowUpRight : ArrowDownRight;
  const iconColor = variant === 'pro' ? 'text-green-600' : 'text-red-600';
  return (
    <li className="flex items-start gap-2">
      <Icon size={14} className={cn('mt-0.5 shrink-0', iconColor)} />
      <span className="text-sm text-gray-900">{shortPreview(text)}</span>
    </li>
  );
};

/**
 * Compact teaser surface for the AI peer review on the proposal sidebar.
 * Renders only for moderators and only when the review has finished.
 * Surfaces the top strength and top weakness, then a "+N more" tail.
 */
export const ReviewInsightsSection: FC<ReviewInsightsSectionProps> = ({
  aiPeerReview,
  reviewsUrl,
}) => {
  const { user } = useUser();
  if (!user?.isModerator) return null;
  if (!aiPeerReview || aiPeerReview.status !== 'completed' || !aiPeerReview.keyInsight) {
    return null;
  }

  const { keyInsight } = aiPeerReview;
  const topStrength = firstKeyInsightTeaser(keyInsight?.items, 'strength');
  const topWeakness = firstKeyInsightTeaser(keyInsight?.items, 'weakness');

  if (!topStrength && !topWeakness) return null;

  return (
    <div>
      <SidebarHeader title="Review Insights" className="mb-2" />
      <ul className="space-y-1.5">
        {topStrength && <InsightRow text={topStrength} variant="pro" />}
        {topWeakness && <InsightRow text={topWeakness} variant="con" />}
      </ul>
      <Link
        href={reviewsUrl}
        className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
      >
        See full analysis
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};
