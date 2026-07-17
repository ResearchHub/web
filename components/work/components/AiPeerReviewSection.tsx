'use client';

import { FC, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { AiPeerReviewVerdictBadge } from '@/components/work/AiPeerReviewCard/AiPeerReviewVerdictBadge';
import type { KeyInsightItem, ProposalReview } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface AiPeerReviewSectionProps {
  aiPeerReview: ProposalReview | null | undefined;
}

const TLDR_MAX_CHARS = 100;
const MAX_PER_KIND = 2;

export const AiPeerReviewSection: FC<AiPeerReviewSectionProps> = ({ aiPeerReview }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { keyInsight, overallRating } = aiPeerReview ?? {};

  const { pros, cons, allPros, allCons } = useMemo(() => {
    if (!keyInsight?.items?.length) return { pros: [], cons: [], allPros: [], allCons: [] };
    const byOrder = (a: KeyInsightItem, b: KeyInsightItem) => a.order - b.order || a.id - b.id;
    const sortedPros = keyInsight.items.filter((i) => i.itemType === 'strength').sort(byOrder);
    const sortedCons = keyInsight.items.filter((i) => i.itemType === 'weakness').sort(byOrder);
    return {
      pros: sortedPros.slice(0, MAX_PER_KIND),
      cons: sortedCons.slice(0, MAX_PER_KIND),
      allPros: sortedPros,
      allCons: sortedCons,
    };
  }, [keyInsight]);

  if (!aiPeerReview || aiPeerReview.status !== 'completed') return null;
  if (!keyInsight) return null;

  const tldr = keyInsight.tldr ?? '';
  const truncatedTldr =
    tldr.length > TLDR_MAX_CHARS ? `${tldr.slice(0, TLDR_MAX_CHARS).trimEnd()}…` : tldr;

  return (
    <div>
      <SidebarHeader
        title="Key Insights"
        action={
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center h-5 rounded-full border border-primary-200 bg-primary-50 px-2 text-[10px] font-semibold uppercase tracking-wider leading-none text-primary-700">
              Beta
            </span>
            <AiPeerReviewVerdictBadge rating={overallRating ?? null} />
          </div>
        }
        className="mb-3"
      />
      <div className="space-y-2.5">
        {truncatedTldr && <p className="text-sm leading-relaxed text-gray-900">{truncatedTldr}</p>}

        {pros.length + cons.length > 0 && (
          <ul className="space-y-1.5">
            {pros.map((i) => (
              <ProConItem key={`pro-${i.id}`} item={i} variant="pro" />
            ))}
            {cons.map((i) => (
              <ProConItem key={`con-${i.id}`} item={i} variant="con" />
            ))}
          </ul>
        )}

        <Button
          type="button"
          variant="outlined"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="mt-1 w-full gap-1.5 !h-7 !px-2 !text-xs font-medium border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300"
        >
          <Sparkles size={12} />
          View full insights
        </Button>
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-gray-900" />
            <span>Key Insights</span>
            <span className="inline-flex items-center h-5 rounded-full border border-primary-200 bg-primary-50 px-2 text-[10px] font-semibold uppercase tracking-wider leading-none text-primary-700">
              Beta
            </span>
            <AiPeerReviewVerdictBadge rating={overallRating ?? null} />
          </div>
        }
        maxWidth="max-w-3xl"
        padding="p-6"
        className="!border-2 !border-transparent ![background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#3b82f6,#a855f7)_border-box]"
      >
        <div className="space-y-6">
          {tldr && (
            <section>
              <h4 className="mb-3 pb-2 border-b border-gray-200 text-base font-semibold text-gray-900">
                TL;DR
              </h4>
              <p className="text-sm leading-relaxed text-gray-900">{tldr}</p>
            </section>
          )}

          {(allPros.length > 0 || allCons.length > 0) && (
            <section>
              <h4 className="mb-3 pb-2 border-b border-gray-200 text-base font-semibold text-gray-900">
                Deep Dive
              </h4>
              <div className="space-y-4">
                {allPros.map((i) => (
                  <DeepDiveItem key={`modal-pro-${i.id}`} item={i} variant="pro" />
                ))}
                {allCons.map((i) => (
                  <DeepDiveItem key={`modal-con-${i.id}`} item={i} variant="con" />
                ))}
              </div>
            </section>
          )}
        </div>
      </BaseModal>
    </div>
  );
};

interface ProConItemProps {
  item: { label: string; description: string };
  variant: 'pro' | 'con';
}

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

const ProConItem: FC<ProConItemProps> = ({ item, variant }) => {
  const Icon = variant === 'pro' ? ArrowUpRight : ArrowDownRight;
  const iconColor = variant === 'pro' ? 'text-green-600' : 'text-red-600';
  const hasLabel = item.label.trim().length > 0;
  const preview = hasLabel ? item.label : item.description;
  const tooltip =
    hasLabel && item.description && item.description !== item.label ? item.description : null;

  const inner = (
    <span className="inline-flex items-start gap-1.5 text-sm text-gray-900">
      <Icon size={14} className={cn('shrink-0 mt-0.5', iconColor)} />
      <span className={cn(tooltip && 'cursor-help border-b border-dashed border-gray-300')}>
        {preview}
      </span>
    </span>
  );

  return (
    <li>
      {tooltip ? (
        <Tooltip content={tooltip} width="w-72" position="top">
          {inner}
        </Tooltip>
      ) : (
        inner
      )}
    </li>
  );
};
