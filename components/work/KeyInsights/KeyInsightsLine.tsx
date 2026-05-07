'use client';

import { FC, useMemo } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { KeyInsightData } from '@/types/aiPeerReview';
import { InsightArrow, topInsightItems } from './shared';

interface KeyInsightsLineProps {
  keyInsight: KeyInsightData;
  onOpenModal: (e: React.MouseEvent) => void;
}

/**
 * Compact gradient callout — used inline below the author meta row when the
 * funder dashboard isn't wide enough for the side panel. The whole container
 * is the click target (opens the modal). Items use grid auto-fit so they
 * sit side-by-side when there's room and stack vertically when narrow.
 */
export const KeyInsightsLine: FC<KeyInsightsLineProps> = ({ keyInsight, onOpenModal }) => {
  const items = useMemo(() => topInsightItems(keyInsight), [keyInsight]);

  return (
    <button
      type="button"
      onClick={onOpenModal}
      aria-label="View full insights"
      className={cn(
        'group/insights mt-2 flex flex-col gap-1 px-2.5 py-2 rounded-lg w-full min-w-0 text-left',
        'bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 border border-primary-100/70',
        'hover:from-primary-100 hover:via-blue-100 hover:to-indigo-100 transition-colors'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1">
          <Sparkles size={11} className="text-primary-600 shrink-0" />
          <span className="text-[11px] font-semibold text-primary-700">Key insights</span>
        </span>
        <ChevronRight
          size={13}
          className="text-primary-600/70 shrink-0 transition-transform group-hover/insights:translate-x-0.5"
        />
      </div>
      <div
        className="grid gap-x-2 gap-y-0.5 min-w-0 text-[11px]"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
      >
        {items.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-0.5 min-w-0">
            <InsightArrow variant={item.variant} size={11} />
            <span className="text-gray-700 truncate">{item.label}</span>
          </span>
        ))}
      </div>
    </button>
  );
};
