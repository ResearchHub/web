'use client';

import Link from 'next/link';
import { ArrowRight, HandCoins, Star } from 'lucide-react';
import {
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewScore,
  resolveDisplayedContribution,
} from '@/components/Activity/lib/feedEntryAdapters';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import type { FeedEntry } from '@/types/feed';

interface MineStripProps {
  entries: FeedEntry[];
}

/**
 * Pattern D — the argument against a switch at all. Patreon spent years on a
 * creator/fan persona toggle and then removed it in favour of one identity, on
 * the grounds that most people are lightly on both sides and switching is pure
 * overhead. Same idea here: pin your commitments above the shared feed so they
 * are always in view, and never split the surface in two.
 */
export function MineStrip({ entries }: MineStripProps) {
  if (entries.length === 0) return null;

  return (
    <section className="border-b border-gray-200 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Your funding · {entries.length}
        </h2>
        <Link
          href="/researchcoin"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-600 hover:text-primary-700"
        >
          Portfolio
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="-mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {entries.map((entry) => (
          <StakeCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function StakeCard({ entry }: { entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { title, href } = getEntryMeta(entry);
  if (!title) return null;

  const isRfp = entry.contentType === 'GRANT';
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const score = getReviewScore(entry);

  let amountLabel: string | null = null;
  if (isRfp && grantAmount) {
    amountLabel = formatCurrency({
      amount: showUSD ? grantAmount.usd : grantAmount.rsc,
      showUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });
  } else if (contribution) {
    const { amount, inUSD } = resolveDisplayedContribution(contribution, showUSD, exchangeRate);
    amountLabel = formatCurrency({
      amount,
      showUSD: inUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });
  }

  const card = (
    <div className="flex h-full w-[196px] shrink-0 flex-col justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 transition-colors group-hover:border-gray-300 group-hover:bg-gray-50/60">
      <div className="flex items-center gap-1.5">
        {isRfp ? (
          <HandCoins size={13} className="shrink-0 text-emerald-600" />
        ) : (
          <HandCoins size={13} className="shrink-0 text-primary-600" />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {isRfp ? 'Your RFP' : 'You backed'}
        </span>
      </div>

      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-gray-900">{title}</p>

      <div className="flex items-center gap-1.5">
        {amountLabel && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-green-800">
            {amountLabel}
          </span>
        )}
        {score != null && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-600">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return card;
  return (
    <Link href={href} className="group block">
      {card}
    </Link>
  );
}
