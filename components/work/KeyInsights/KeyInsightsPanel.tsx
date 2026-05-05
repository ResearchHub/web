'use client';

import { FC, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { KeyInsightData } from '@/types/aiPeerReview';
import { InsightArrow, topInsightItems } from './shared';

interface KeyInsightsPanelProps {
  keyInsight: KeyInsightData;
  onOpenModal: (e: React.MouseEvent) => void;
}

/** Vertical panel — used in the funder dashboard's wide side column. */
export const KeyInsightsPanel: FC<KeyInsightsPanelProps> = ({ keyInsight, onOpenModal }) => {
  const items = useMemo(() => topInsightItems(keyInsight), [keyInsight]);

  return (
    <>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles size={11} className="text-primary-600" />
        <span className="text-[11px] font-semibold text-gray-700">Key insights</span>
      </div>
      {items.length > 0 && (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 min-w-0">
              <InsightArrow variant={item.variant} />
              <span className="text-[11.5px] font-medium text-gray-800 line-clamp-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onOpenModal}
        className={cn(
          'mt-2 inline-flex items-center text-[11px] font-semibold whitespace-nowrap',
          'text-primary-600 hover:text-primary-700 hover:underline'
        )}
      >
        View full insights →
      </button>
    </>
  );
};
