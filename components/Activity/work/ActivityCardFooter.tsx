'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { cn } from '@/utils/styles';
import { ActivityWorkActions } from './ActivityWorkActions';
import type { ActivityCta, ActivityWork } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';

/** Neutral on purpose: the card's one button never takes the primary colour. */
const CTA_CLASS =
  'inline-flex h-11 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 tablet:h-10 tablet:rounded-[10px] tablet:px-4';

function ActivityCtaButton({
  cta,
  work,
  onOpenComment,
}: Readonly<{ cta: ActivityCta; work: ActivityWork; onOpenComment?: () => void }>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (cta.kind === 'panel') {
    return (
      <button type="button" onClick={onOpenComment} className={CTA_CLASS}>
        {cta.label}
      </button>
    );
  }

  if (cta.kind === 'link') {
    return (
      <Link href={cta.href} className={CTA_CLASS}>
        {cta.label}
      </Link>
    );
  }

  const close = () => setIsModalOpen(false);

  // Funding modals mount only once opened: a feed holds many cards, and the modal
  // looks up the fundraise's nonprofit and wallet balances as soon as it renders.
  return (
    <>
      <button type="button" onClick={() => setIsModalOpen(true)} className={CTA_CLASS}>
        {cta.kind === 'fund-proposal' ? (
          // The full label would squeeze the action row on a phone.
          <>
            <span className="tablet:hidden">{cta.shortLabel}</span>
            <span className="hidden tablet:inline">{cta.label}</span>
          </>
        ) : (
          cta.label
        )}
      </button>
      {isModalOpen && cta.kind === 'fund-proposal' && (
        <ContributeToFundraiseModal
          isOpen
          onClose={close}
          onContributeSuccess={close}
          fundraise={cta.fundraise}
          proposalTitle={work.title}
        />
      )}
      {isModalOpen && cta.kind === 'fund-pool' && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen
          onClose={close}
          onContributeSuccess={close}
          fundingPool={cta.fundingPool}
          proposalTitle={work.title}
        />
      )}
    </>
  );
}

interface ActivityCardFooterProps {
  entry: FeedEntry;
  work: ActivityWork;
  cta: ActivityCta;
  /** Feed entries the card stands for, offered to moderators hiding it. */
  hideableEntries?: FeedEntry[];
  /** Opens the card's side panel, for a "Read review" or "Read update" button. */
  onOpenComment?: () => void;
  className?: string;
}

/**
 * Votes in a pill with share and save beside it on the left; the card's one button
 * on the right. The ⋯ menu lives in the card's header instead.
 */
export const ActivityCardFooter: FC<ActivityCardFooterProps> = ({
  entry,
  work,
  cta,
  hideableEntries,
  onOpenComment,
  className,
}) => (
  <div className={cn('pt-3', className)}>
    <ActivityWorkActions
      entry={entry}
      work={work}
      hideableEntries={hideableEntries}
      groupUtilityActions
      variant="card"
      hideMoreMenu
      className="gap-1.5 tablet:gap-2"
      trailing={<ActivityCtaButton cta={cta} work={work} onOpenComment={onOpenComment} />}
    />
  </div>
);
