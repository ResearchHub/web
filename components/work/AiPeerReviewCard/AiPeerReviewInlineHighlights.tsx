'use client';

import { FC, Fragment } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';

interface AiPeerReviewInlineHighlightsProps {
  strengths: string[];
  weaknesses: string[];
}

const MAX_PER_KIND = 3;

const SHORT_PREVIEW_CHARS = 60;

function shortPreview(text: string): string {
  const idx = text.indexOf(':');
  const head = (idx === -1 ? text : text.slice(0, idx)).trim();
  return head.length > SHORT_PREVIEW_CHARS
    ? `${head.slice(0, SHORT_PREVIEW_CHARS).trimEnd()}…`
    : head;
}

interface Item {
  full: string;
  variant: 'pro' | 'con';
}

const HighlightPill: FC<{ item: Item }> = ({ item }) => {
  const preview = shortPreview(item.full);
  const hasTooltip = preview !== item.full;
  const Icon = item.variant === 'pro' ? ArrowUpRight : ArrowDownRight;
  const iconColor = item.variant === 'pro' ? 'text-green-600' : 'text-red-600';

  const inner = (
    <span className="inline-flex items-center gap-1 text-sm text-gray-900">
      <Icon size={14} className={cn('shrink-0', iconColor)} />
      <span className={cn(hasTooltip && 'cursor-help border-b border-dashed border-gray-300')}>
        {preview}
      </span>
    </span>
  );

  return hasTooltip ? (
    <Tooltip content={item.full} width="w-72" position="top">
      {inner}
    </Tooltip>
  ) : (
    inner
  );
};

export const AiPeerReviewInlineHighlights: FC<AiPeerReviewInlineHighlightsProps> = ({
  strengths,
  weaknesses,
}) => {
  const items: Item[] = [
    ...strengths.slice(0, MAX_PER_KIND).map((full): Item => ({ full, variant: 'pro' })),
    ...weaknesses.slice(0, MAX_PER_KIND).map((full): Item => ({ full, variant: 'con' })),
  ];

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
