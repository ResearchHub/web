import { FC } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { KeyInsightData, KeyInsightItem } from '@/types/aiPeerReview';

export const MAX_INSIGHT_ITEMS_PER_KIND = 1;

const sortByOrder = (a: KeyInsightItem, b: KeyInsightItem) => a.order - b.order || a.id - b.id;

export interface PreviewItem extends KeyInsightItem {
  variant: 'pro' | 'con';
}

/**
 * Pick the top strengths + weaknesses (by order) for compact preview UIs.
 * Caps each kind at {@link MAX_INSIGHT_ITEMS_PER_KIND}.
 */
export function topInsightItems(keyInsight: KeyInsightData): PreviewItem[] {
  const pros = keyInsight.items
    .filter((i) => i.itemType === 'strength')
    .sort(sortByOrder)
    .slice(0, MAX_INSIGHT_ITEMS_PER_KIND);
  const cons = keyInsight.items
    .filter((i) => i.itemType === 'weakness')
    .sort(sortByOrder)
    .slice(0, MAX_INSIGHT_ITEMS_PER_KIND);
  return [
    ...pros.map((i) => ({ ...i, variant: 'pro' as const })),
    ...cons.map((i) => ({ ...i, variant: 'con' as const })),
  ];
}

export const InsightArrow: FC<{ variant: 'pro' | 'con'; size?: number }> = ({
  variant,
  size = 12,
}) =>
  variant === 'pro' ? (
    <ArrowUpRight size={size} className="text-green-600 shrink-0" />
  ) : (
    <ArrowDownRight size={size} className="text-red-600 shrink-0" />
  );
