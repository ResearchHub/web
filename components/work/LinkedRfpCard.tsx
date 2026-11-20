'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import { isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { getLinkedGrantLink } from '@/components/work/lib/linkedGrant';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { Work } from '@/types/work';
import { formatCurrencyAmount } from '@/utils/currency';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

/**
 * The RFP a proposal answers, in its sidebar under the funding card: the RFP's
 * image, name, funder and amount, whether it is still open and how many
 * proposals it has. The whole row opens the RFP.
 */
export function LinkedRfpCard({ work }: { work: Work }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const grant = work.linkedGrant;
  const { title, href } = getLinkedGrantLink(work);
  if (!grant || !title) return null;

  const isPrize = isAwardMechanism(grant.fundingMechanism);
  const isOpen = grant.status === 'OPEN';
  const count = grant.applicantCount;
  const amount =
    grant.fundingAmount > 0
      ? formatCurrencyAmount({
          amount: grant.fundingAmount,
          currency: grant.currency === 'USD' ? 'USD' : 'RSC',
          showUSD,
          exchangeRate,
          shorten: true,
        })
      : undefined;
  // The title falls back to the organization, so don't name it twice.
  const funder = grant.organization.trim() !== title ? grant.organization.trim() : '';
  const byline = [funder, amount].filter(Boolean).join(' · ');

  const row = (
    <>
      <DocumentThumbnail image={grant.imageUrl} />
      <span className="min-w-0 flex-1 text-[13px] leading-[18px]">
        <span className="line-clamp-2 font-semibold text-gray-900">{title}</span>
        {byline && <span className="mt-0.5 block truncate text-gray-500">{byline}</span>}
        <span className="mt-0.5 flex items-center gap-1.5 text-gray-500">
          <span
            aria-hidden="true"
            className={cn('h-1.5 w-1.5 rounded-full', isOpen ? 'bg-emerald-500' : 'bg-gray-400')}
          />
          {isOpen ? 'Open' : 'Closed'}
          {count > 0 && (
            <>
              <span aria-hidden="true">·</span>
              {count} {isPrize ? 'competitor' : 'proposal'}
              {pluralizeSuffix(count)}
            </>
          )}
        </span>
      </span>
    </>
  );

  return (
    <SidebarCard title={isPrize ? 'Competing for' : 'Submitted to'}>
      {href ? (
        <Link
          href={href}
          className="group -mx-2 mt-2 flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
        >
          {row}
          <ChevronRight
            className="mt-2.5 h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <div className="mt-2 flex items-start gap-2.5 py-2">{row}</div>
      )}
    </SidebarCard>
  );
}
