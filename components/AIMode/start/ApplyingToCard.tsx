import { Target } from 'lucide-react';
import { isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import type { SelectedGrantDetails } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import { cn } from '@/utils/styles';

interface ApplyingToCardProps {
  readonly grant: SelectedGrantDetails;
  readonly className?: string;
}

/**
 * Over a researcher's composer once an RFP is picked: says that what they
 * draft here is their application to it, with the RFP's cover, name, funder
 * and what it offers.
 */
export function ApplyingToCard({ grant, className }: ApplyingToCardProps) {
  const offer =
    grant.fundingAmount > 0
      ? `${formatCompactAmount(grant.fundingAmount)} ${isAwardMechanism(grant.fundingMechanism) ? 'prize' : 'funding'}`
      : null;
  const facts = [grant.organization.trim(), offer].filter(Boolean).join(' · ');

  return (
    <div
      data-testid="workspace-applying-to"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3',
        className
      )}
    >
      {grant.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={grant.imageUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 ring-1 ring-primary-100"
        >
          <Target className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.07em] text-primary-700">
          Submitting an application to
        </span>
        <span className="block truncate text-sm font-semibold text-gray-900">
          {grant.shortTitle}
        </span>
        {facts && <span className="block truncate text-xs text-gray-600">{facts}</span>}
      </span>
    </div>
  );
}
