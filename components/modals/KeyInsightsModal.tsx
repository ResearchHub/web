'use client';

import { FC, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import type { KeyInsightData, KeyInsightItem } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface KeyInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyInsight: KeyInsightData;
}

const byOrder = (a: KeyInsightItem, b: KeyInsightItem) => a.order - b.order || a.id - b.id;

export const KeyInsightsModal: FC<KeyInsightsModalProps> = ({ isOpen, onClose, keyInsight }) => {
  const { allPros, allCons } = useMemo(() => {
    const pros = keyInsight.items.filter((i) => i.itemType === 'strength').sort(byOrder);
    const cons = keyInsight.items.filter((i) => i.itemType === 'weakness').sort(byOrder);
    return { allPros: pros, allCons: cons };
  }, [keyInsight]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      padding="p-6"
      className="!border-2 !border-transparent ![background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#3b82f6,#a855f7)_border-box]"
      title={
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-gray-900" />
          <span>Key Insights</span>
          <span className="inline-flex items-center h-5 rounded-full border border-primary-200 bg-primary-50 px-2 text-[10px] font-semibold uppercase tracking-wider leading-none text-primary-700">
            Beta
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {keyInsight.tldr && (
          <section>
            <h4 className="mb-3 pb-2 border-b border-gray-200 text-base font-semibold text-gray-900">
              TL;DR
            </h4>
            <p className="text-sm leading-relaxed text-gray-900">{keyInsight.tldr}</p>
          </section>
        )}

        {(allPros.length > 0 || allCons.length > 0) && (
          <section>
            <h4 className="mb-3 pb-2 border-b border-gray-200 text-base font-semibold text-gray-900">
              Deep Dive
            </h4>
            <div className="space-y-4">
              {allPros.map((i) => (
                <DeepDiveItem key={`p-${i.id}`} item={i} variant="pro" />
              ))}
              {allCons.map((i) => (
                <DeepDiveItem key={`c-${i.id}`} item={i} variant="con" />
              ))}
            </div>
          </section>
        )}
      </div>
    </BaseModal>
  );
};

const DeepDiveItem: FC<{ item: KeyInsightItem; variant: 'pro' | 'con' }> = ({ item, variant }) => {
  const Icon = variant === 'pro' ? ArrowUpRight : ArrowDownRight;
  const iconColor = variant === 'pro' ? 'text-green-600' : 'text-red-600';
  const hasLabel = item.label.trim().length > 0;
  const showSeparateDescription = hasLabel && item.description && item.description !== item.label;

  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className={cn('shrink-0 mt-0.5', iconColor)} />
      <div className="min-w-0 flex-1">
        {hasLabel && <div className="text-sm font-semibold text-gray-900">{item.label}</div>}
        {showSeparateDescription ? (
          <p className="mt-0.5 text-sm leading-relaxed text-gray-700">{item.description}</p>
        ) : !hasLabel && item.description ? (
          <p className="text-sm leading-relaxed text-gray-900">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
};
