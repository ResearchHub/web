'use client';

import Link from 'next/link';
import { Clock, Inbox, PenLine } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FUNDING_KIND_ICON } from '@/components/Funding/fundingKind';
import type { UpNextItem } from '@/components/Funding/dashboard/lib/myFundingModel';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { cn } from '@/utils/styles';

const ICONS = { inbox: Inbox, clock: Clock, update: PenLine } as const;

const TONES = {
  blue: 'bg-primary-50 text-primary-600',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
} as const;

function ItemIcon({ icon }: { readonly icon: UpNextItem['icon'] }) {
  // Drafting items carry the Publish menu's icons.
  if (icon === 'rfp' || icon === 'proposal') {
    return <FontAwesomeIcon icon={FUNDING_KIND_ICON[icon]} className="h-5 w-5" />;
  }
  const Icon = ICONS[icon];
  return <Icon className="h-5 w-5" aria-hidden="true" />;
}

interface UpNextProps {
  readonly items: readonly UpNextItem[];
  /** Called when the user follows an item, so an RFP's proposals can be marked seen. */
  readonly onFollow?: (item: UpNextItem) => void;
}

/** What needs the user now, at most two cards; nothing at all when nothing does. */
export function UpNext({ items, onFollow }: UpNextProps) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="my-funding-up-next">
      <h2 id="my-funding-up-next" className="text-base font-semibold text-gray-900">
        Up next
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const actionClass = cn(
            'inline-flex h-9 w-fit items-center rounded-lg px-3.5 text-sm font-semibold transition-colors',
            index === 0
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          );
          const { draft } = item;
          return (
            // Cards in a row share a height, and each action sits at the foot
            // of its card so the buttons line up however long the text runs.
            <div
              key={item.key}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    TONES[item.tone]
                  )}
                >
                  <ItemIcon icon={item.icon} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{item.detail}</p>
                </div>
              </div>
              <div className="mt-auto pt-3.5">
                {draft ? (
                  <button
                    type="button"
                    onClick={() => executeAuthenticatedAction(() => startNew(draft))}
                    className={actionClass}
                  >
                    {item.actionLabel}
                  </button>
                ) : (
                  item.href && (
                    <Link href={item.href} onClick={() => onFollow?.(item)} className={actionClass}>
                      {item.actionLabel}
                    </Link>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
