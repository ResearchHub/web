'use client';

import { FC, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CountBadge } from '@/components/ui/CountBadge';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { SidePanel } from '@/components/ui/SidePanel';
import { AiPeerReviewVerdictBadge } from '@/components/work/AiPeerReviewCard/AiPeerReviewVerdictBadge';
import type { KeyInsightItem, KeyInsightItemType, ProposalReview } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';

interface AiPeerReviewSectionProps {
  aiPeerReview: ProposalReview | null | undefined;
}

/** Strengths the card lists, and weaknesses; the panel has them all. */
const MAX_PER_KIND = 2;

/**
 * The AI's read of the proposal, as a sidebar card in the other cards' style:
 * the opening of its summary, the top strengths and weaknesses, and a link to
 * all of it in a side panel.
 */
export const AiPeerReviewSection: FC<AiPeerReviewSectionProps> = ({ aiPeerReview }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { keyInsight, overallRating } = aiPeerReview ?? {};

  const { strengths, weaknesses } = useMemo(() => {
    const items = keyInsight?.items ?? [];
    const byOrder = (a: KeyInsightItem, b: KeyInsightItem) => a.order - b.order || a.id - b.id;
    return {
      strengths: items.filter((i) => i.itemType === 'strength').sort(byOrder),
      weaknesses: items.filter((i) => i.itemType === 'weakness').sort(byOrder),
    };
  }, [keyInsight]);

  if (aiPeerReview?.status !== 'completed' || !keyInsight) return null;

  const tldr = keyInsight.tldr ?? '';
  const shown = [...strengths.slice(0, MAX_PER_KIND), ...weaknesses.slice(0, MAX_PER_KIND)];
  const verdict = <AiPeerReviewVerdictBadge rating={overallRating ?? null} />;

  return (
    <SidebarCard
      title={
        <>
          Key insights
          <BetaChip />
        </>
      }
      action={verdict}
    >
      {tldr && <p className="mt-2 line-clamp-3 text-[13px] leading-[18px] text-gray-700">{tldr}</p>}

      {shown.length > 0 && (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {shown.map((item) => (
            <li
              key={`${item.itemType}-${item.id}`}
              className="flex items-start gap-1.5 text-[13px] leading-[18px] text-gray-900"
            >
              <InsightIcon kind={item.itemType} size={14} className="mt-0.5" />
              <span className="min-w-0">{item.label.trim() || item.description}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setIsPanelOpen(true)}
        className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        Read the full insights
      </button>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={
          <span className="flex min-w-0 items-center gap-2">
            Key insights
            <BetaChip />
            {verdict}
          </span>
        }
        widthClassName="w-full tablet:max-w-[440px]"
      >
        <div className="space-y-6 p-4 tablet:p-6">
          {tldr && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">{tldr}</p>
            </section>
          )}
          <InsightList heading="Strengths" items={strengths} />
          <InsightList heading="Weaknesses" items={weaknesses} />
        </div>
      </SidePanel>
    </SidebarCard>
  );
};

/** That the insights are an early feature, as a muted chip beside their title. */
function BetaChip() {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 text-xs font-medium leading-5 text-gray-500">
      Beta
    </span>
  );
}

function InsightIcon({
  kind,
  size,
  className,
}: {
  kind: KeyInsightItemType;
  size: number;
  className?: string;
}) {
  const isStrength = kind === 'strength';
  const Icon = isStrength ? ArrowUpRight : ArrowDownRight;
  return (
    <Icon
      role="img"
      aria-label={isStrength ? 'Strength' : 'Weakness'}
      size={size}
      className={cn('shrink-0', isStrength ? 'text-green-600' : 'text-red-600', className)}
    />
  );
}

/** One kind of insight in the panel, each with what the AI said about it. */
function InsightList({ heading, items }: { heading: string; items: KeyInsightItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        {heading}
        <CountBadge count={items.length} />
      </h3>
      <ul className="mt-3 space-y-4">
        {items.map((item) => {
          const label = item.label.trim();
          const description = item.description !== item.label ? item.description : '';
          return (
            <li key={`${item.itemType}-${item.id}`} className="flex items-start gap-2">
              <InsightIcon kind={item.itemType} size={16} className="mt-1" />
              <div className="min-w-0 text-sm leading-6">
                {label && <p className="font-semibold text-gray-900">{label}</p>}
                {description && (
                  <p className={label ? 'text-gray-700' : 'text-gray-900'}>{description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
