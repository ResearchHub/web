'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { ACTIVITY_CTA_CLASS, ActivityFooterRow } from '../cards/ActivityFooterRow';
import { ActivityWorkActions } from './ActivityWorkActions';
import type { ActivityCta, ActivityWork } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';

function ActivityCtaButton({
  cta,
  work,
  onOpenComment,
}: Readonly<{ cta: ActivityCta; work: ActivityWork; onOpenComment?: () => void }>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (cta.kind === 'panel') {
    return (
      <button type="button" onClick={onOpenComment} className={ACTIVITY_CTA_CLASS}>
        {cta.label}
      </button>
    );
  }

  if (cta.kind === 'link') {
    return (
      <Link href={cta.href} className={ACTIVITY_CTA_CLASS}>
        {cta.label}
      </Link>
    );
  }

  const close = () => setIsModalOpen(false);

  // Funding modals mount only once opened: a feed holds many cards, and the modal
  // looks up the fundraise's nonprofit and wallet balances as soon as it renders.
  return (
    <>
      <button type="button" onClick={() => setIsModalOpen(true)} className={ACTIVITY_CTA_CLASS}>
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
 * Votes with share and save beside them on the left; the card's one button on the
 * right. The ⋯ menu lives in the card's header instead.
 */
export const ActivityCardFooter: FC<ActivityCardFooterProps> = ({
  entry,
  work,
  cta,
  hideableEntries,
  onOpenComment,
  className,
}) => (
  <ActivityFooterRow
    className={className}
    actions={
      <ActivityWorkActions
        entry={entry}
        work={work}
        hideableEntries={hideableEntries}
        groupUtilityActions
        variant="card"
        hideMoreMenu
        // The up arrow is pulled out to sit flush with the text above.
        className="-ml-1.5 gap-2"
      />
    }
    cta={<ActivityCtaButton cta={cta} work={work} onOpenComment={onOpenComment} />}
  />
);
