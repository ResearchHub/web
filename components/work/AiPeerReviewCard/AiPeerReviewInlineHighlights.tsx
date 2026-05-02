'use client';

import { FC, Fragment, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import type { KeyInsightData } from '@/types/aiPeerReview';

interface AiPeerReviewInlineHighlightsProps {
  keyInsight: KeyInsightData | null;
}

const MAX_PER_KIND = 5;

interface PillItem {
  preview: string;
  tooltip: string | null;
  variant: 'pro' | 'con';
}

const HighlightPill: FC<{ item: PillItem }> = ({ item }) => {
  const hasTooltip =
    item.tooltip != null && item.tooltip.length > 0 && item.tooltip !== item.preview;
  const Icon = item.variant === 'pro' ? ArrowUpRight : ArrowDownRight;
  const iconColor = item.variant === 'pro' ? 'text-green-600' : 'text-red-600';

  const inner = (
    <span className="inline-flex items-center gap-1 text-sm text-gray-900">
      <Icon size={14} className={cn('shrink-0', iconColor)} />
      <span className={cn(hasTooltip && 'cursor-help border-b border-dashed border-gray-300')}>
        {item.preview}
      </span>
    </span>
  );

  return hasTooltip && item.tooltip ? (
    <Tooltip content={item.tooltip} width="w-72" position="top">
      {inner}
    </Tooltip>
  ) : (
    inner
  );
};

export const AiPeerReviewInlineHighlights: FC<AiPeerReviewInlineHighlightsProps> = ({
  keyInsight,
}) => {
  const items = useMemo((): PillItem[] => {
    if (!keyInsight?.items?.length) return [];
    const byOrder = (a: (typeof keyInsight.items)[0], b: (typeof keyInsight.items)[0]) =>
      a.order - b.order || a.id - b.id;
    const pros = keyInsight.items
      .filter((i) => i.itemType === 'strength')
      .sort(byOrder)
      .slice(0, MAX_PER_KIND);
    const cons = keyInsight.items
      .filter((i) => i.itemType === 'weakness')
      .sort(byOrder)
      .slice(0, MAX_PER_KIND);
    return [
      ...pros.map((i): PillItem => {
        const hasLabel = i.label.trim().length > 0;
        const preview = hasLabel ? i.label : i.description;
        const tooltip =
          hasLabel && i.description && i.description !== i.label ? i.description : null;
        return { preview, tooltip, variant: 'pro' as const };
      }),
      ...cons.map((i): PillItem => {
        const hasLabel = i.label.trim().length > 0;
        const preview = hasLabel ? i.label : i.description;
        const tooltip =
          hasLabel && i.description && i.description !== i.label ? i.description : null;
        return { preview, tooltip, variant: 'con' as const };
      }),
    ];
  }, [keyInsight]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map((item, i) => (
        <Fragment key={`${item.variant}-${i}`}>
          {i > 0 && (
            <span className="text-gray-300" aria-hidden>
              |
            </span>
          )}
          <HighlightPill item={item} />
        </Fragment>
      ))}
    </div>
  );
};
