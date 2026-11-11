'use client';

import { useState } from 'react';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Button } from '@/components/ui/Button';
import { useFundraiseSummary } from '@/components/Funding/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';
import { formatCompactAmount } from '@/utils/currency';
import { cn } from '@/utils/styles';
import { CAUSES, type CauseId } from '@/app/giving-tuesday/lib/causes';
import {
  IS_GIVING_ENABLED,
  getNeededUsd,
  isGiftable,
  type GiftProposal,
} from '@/app/giving-tuesday/lib/giftProposals';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

type Cause = (typeof CAUSES)[number];

/** The causes carousel, the chosen cause's proposals, and a gift to one of them in place. */
export function GivingTuesdayCauses({ proposals }: { proposals: GiftProposal[] }) {
  const [causeId, setCauseId] = useState<CauseId>();
  const [giftTarget, setGiftTarget] = useState<GiftProposal>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cause = CAUSES.find((candidate) => candidate.id === causeId);

  function openGift(proposal: GiftProposal) {
    setGiftTarget(proposal);
    setIsModalOpen(true);
  }

  return (
    <section id="causes" className="scroll-mt-4 px-5 pt-16 lg:px-7 lg:pt-20">
      <div className="mx-auto max-w-[1180px]">
        <h2
          className="text-[30px] font-bold leading-[1.08] text-navy lg:text-[40px]"
          style={DISPLAY_FONT}
        >
          Pick a cause you care about
        </h2>
        <p className="mt-3 max-w-[640px] text-lg text-gray-600">
          Each project is run by a researcher at a nonprofit institution. Your gift pays for the
          work itself: the people, the supplies and the experiments.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:-mx-5 sm:flex sm:snap-x sm:overflow-x-auto sm:px-5 sm:pb-3 lg:mx-0 lg:px-0">
          {CAUSES.map((candidate) => (
            <CauseCard
              key={candidate.id}
              cause={candidate}
              proposals={proposals.filter((proposal) => proposal.causeId === candidate.id)}
              isSelected={candidate.id === causeId}
              onSelect={() => setCauseId(candidate.id)}
            />
          ))}
        </div>

        {cause ? (
          <ul key={cause.id} className="mt-6 space-y-3">
            {proposals
              .filter((proposal) => proposal.causeId === cause.id)
              .map((proposal, index) => (
                <ProposalRow
                  key={proposal.id}
                  proposal={proposal}
                  cause={cause}
                  delayMs={index * 60}
                  onGive={() => openGift(proposal)}
                />
              ))}
          </ul>
        ) : (
          <p className="mt-6 text-gray-500">Pick a cause above to see its projects.</p>
        )}
        <p className="mt-6 text-sm text-gray-600">
          Giving from a donor-advised fund that isn’t held at Endaoment?{' '}
          <a
            href={TALK_TO_TEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Schedule a call with Tyler
          </a>
        </p>
        {!IS_GIVING_ENABLED && (
          <p className="mt-4 text-sm text-gray-500">
            These are production proposals, so giving is turned off in this environment.
          </p>
        )}
      </div>

      {giftTarget?.fundraise && (
        <ContributeToFundraiseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fundraise={giftTarget.fundraise}
          proposalTitle={giftTarget.title}
          maxAmountUsd={getNeededUsd(giftTarget)}
          variant="panel"
        />
      )}
    </section>
  );
}

/** Shows what the cause still needs, or how many projects it has once none can take a gift. */
function CauseCard({
  cause,
  proposals,
  isSelected,
  onSelect,
}: {
  cause: Cause;
  proposals: GiftProposal[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const neededUsd = proposals.reduce((sum, proposal) => sum + getNeededUsd(proposal), 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'rounded-2xl border-2 bg-white p-4 text-left transition-colors sm:w-[200px] sm:shrink-0 sm:snap-start',
        isSelected ? 'border-navy' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <span
        className={cn('flex h-10 w-10 items-center justify-center rounded-xl', cause.iconClassName)}
      >
        <cause.Icon className="h-5 w-5" />
      </span>
      <span className="mt-3 block font-semibold leading-tight text-navy">{cause.label}</span>
      <span className="mt-1 block text-[13px] leading-snug text-gray-500">{cause.blurb}</span>
      <span className="mt-3 block text-xs font-medium text-gray-400">
        {neededUsd > 0
          ? `${formatCompactAmount(neededUsd)} needed`
          : `${proposals.length} ${proposals.length === 1 ? 'project' : 'projects'}`}
      </span>
    </button>
  );
}

/** Proposals that can't take a gift stay listed, grayed out, below the rest. */
function ProposalRow({
  proposal,
  cause,
  delayMs,
  onGive,
}: {
  proposal: GiftProposal;
  cause: Cause;
  delayMs: number;
  onGive: () => void;
}) {
  const canGive = isGiftable(proposal.fundraise);

  return (
    <li
      className={cn(
        'flex animate-fadeIn flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 [animation-fill-mode:both] sm:flex-row sm:items-center sm:gap-8',
        !canGive && 'opacity-60 grayscale'
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
            cause.tagClassName
          )}
        >
          {cause.label}
        </span>
        <h3 className="mt-2 font-semibold leading-snug text-navy">{proposal.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{proposal.summary}</p>
      </div>
      <div className="sm:w-[200px] sm:shrink-0">
        {proposal.fundraise && <FundingProgress fundraise={proposal.fundraise} />}
        {canGive ? (
          <Button
            onClick={onGive}
            disabled={!IS_GIVING_ENABLED}
            className="mt-3 w-full font-semibold"
          >
            Give
          </Button>
        ) : (
          proposal.fundraise && <FundedLabel fundraise={proposal.fundraise} />
        )}
      </div>
    </li>
  );
}

function FundingProgress({ fundraise }: { fundraise: Fundraise }) {
  const { raised, goal, barPercent } = useFundraiseSummary(fundraise);
  return (
    <>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${barPercent}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        <span className="font-semibold text-navy">{raised}</span> of {goal}
      </p>
    </>
  );
}

/** An open fundraise that has met its goal has no status label of its own. */
function FundedLabel({ fundraise }: { fundraise: Fundraise }) {
  const { statusLabel } = useFundraiseSummary(fundraise);
  return (
    <p className="mt-3 text-center text-sm font-semibold text-gray-500">
      {statusLabel ?? 'Fully funded'}
    </p>
  );
}
