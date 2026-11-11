'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Microscope } from 'lucide-react';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Button } from '@/components/ui/Button';
import { useFundraiseSummary } from '@/components/Funding/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';
import type { FeedGrantContent, FeedPostContent } from '@/types/feed';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import { cn } from '@/utils/styles';

type Cause = FeedGrantContent | FeedPostContent;

interface GiftBuilderProps {
  rfps: FeedGrantContent[];
  proposals: FeedPostContent[];
  className?: string;
}

const PATHS = [
  {
    id: 'science',
    label: 'Give to science',
    hint: 'We send it to the project closest to its goal',
  },
  { id: 'cause', label: 'Pick a cause', hint: 'Choose the RFP or project you care about' },
] as const;

type GiftPath = (typeof PATHS)[number]['id'];

/** The two ways to give: to the project closest to its goal, or to one RFP or project the donor picks. */
export function GiftBuilder({ rfps, proposals, className }: GiftBuilderProps) {
  const causes: Cause[] = [...rfps, ...proposals];
  const [path, setPath] = useState<GiftPath>('science');
  const [causeId, setCauseId] = useState(causes[0]?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cause = causes.find((candidate) => candidate.id === causeId);

  const isScience = path === 'science';
  const isRfp = cause?.contentType === 'GRANT';
  // The page sorts proposals closest to their goal first.
  const closestToGoal = proposals[0];
  const target: Cause | undefined = isScience ? closestToGoal : cause;
  const modalState = { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) };

  return (
    <div className={cn('rounded-2xl bg-white p-6', className)}>
      <div className="mb-5 grid grid-cols-2 gap-3">
        {PATHS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPath(option.id)}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-colors',
              path === option.id
                ? 'border-primary-600 bg-primary-50/60'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <span className="flex items-center gap-2">
              {option.id === 'science' || !causes.length ? (
                <Microscope className="h-5 w-5 text-primary-600" />
              ) : (
                <span className="flex -space-x-2">
                  {causes.slice(0, 3).map((candidate) => (
                    <CauseImage
                      key={candidate.id}
                      cause={candidate}
                      sizes="22px"
                      className="h-[22px] w-[22px] rounded-full ring-2 ring-white"
                    />
                  ))}
                </span>
              )}
              <span className="font-semibold text-navy">{option.label}</span>
            </span>
            <span className="mt-1 block text-[13px] text-gray-500">{option.hint}</span>
          </button>
        ))}
      </div>

      {isScience ? (
        <>
          <p className="text-sm text-gray-600">
            We send your gift to the open project closest to being fully funded.
          </p>
          {closestToGoal && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <ProposalDetails proposal={closestToGoal} />
            </div>
          )}
        </>
      ) : !cause ? (
        <p className="text-sm text-gray-600">Open RFPs and projects will show here.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {causes.map((candidate) => (
              <CauseTile
                key={candidate.id}
                cause={candidate}
                isSelected={candidate.id === cause.id}
                onSelect={() => setCauseId(candidate.id)}
              />
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            {cause.contentType === 'GRANT' ? (
              <RfpDetails rfp={cause} />
            ) : (
              <ProposalDetails proposal={cause} />
            )}
          </div>
        </>
      )}

      <Button
        size="lg"
        disabled={!target}
        onClick={() => setIsModalOpen(true)}
        className="mt-5 w-full font-semibold"
      >
        {isScience ? 'Give to science' : `Give to this ${isRfp ? 'RFP' : 'project'}`}
      </Button>
      {!target && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Giving isn’t available right now. Please check back soon.
        </p>
      )}

      {target &&
        (target.contentType === 'GRANT' ? (
          <ContributeToFundraiseModal
            {...modalState}
            mode="fundingPool"
            fundingPool={target.grant.fundingPool!}
            proposalTitle={target.title}
          />
        ) : (
          <ContributeToFundraiseModal
            {...modalState}
            fundraise={target.fundraise!}
            headerTitle={isScience ? 'Give to science' : undefined}
            proposalTitle={target.title}
          />
        ))}
    </div>
  );
}

function CauseImage({
  cause,
  sizes,
  className,
}: {
  cause: Cause;
  sizes: string;
  className?: string;
}) {
  return (
    <span
      className={cn('relative block overflow-hidden', className)}
      style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
    >
      {cause.previewImage && (
        <Image src={cause.previewImage} alt="" fill sizes={sizes} className="object-cover" />
      )}
    </span>
  );
}

function CauseTile({
  cause,
  isSelected,
  onSelect,
}: {
  cause: Cause;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={cause.title}
      aria-pressed={isSelected}
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg ring-2 transition',
        isSelected ? 'ring-primary-600' : 'ring-transparent opacity-80 hover:opacity-100'
      )}
    >
      <CauseImage cause={cause} sizes="80px" className="absolute inset-0" />
      <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[10px] font-semibold text-white">
        {cause.contentType === 'GRANT' ? (
          formatCompactAmount(cause.grant.amount.usd)
        ) : (
          <FundedPercent fundraise={cause.fundraise!} />
        )}
      </span>
      {isSelected && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function FundedPercent({ fundraise }: { fundraise: Fundraise }) {
  return <>{useFundraiseSummary(fundraise).percent}% funded</>;
}

/** No goal bar: an RFP's pool has no target, only the funder's grant and what donors add. */
function RfpDetails({ rfp }: { rfp: FeedGrantContent }) {
  const raisedUsd = rfp.grant.fundingPool?.amountRaised.usd ?? 0;
  return (
    <>
      <p className="text-sm text-gray-500">{rfp.grant.organization}</p>
      <p className="font-semibold text-navy">{rfp.grant.shortTitle || rfp.title}</p>
      <p className="mt-2 text-sm text-gray-600">
        <span className="font-semibold text-navy">
          {formatCompactAmount(rfp.grant.amount.usd)} RFP
        </span>
        {raisedUsd > 0 && ` + ${formatCompactAmount(raisedUsd)} from donors`}
      </p>
    </>
  );
}

function ProposalDetails({ proposal }: { proposal: FeedPostContent }) {
  const { raised, goal, barPercent } = useFundraiseSummary(proposal.fundraise!);
  const byline = [proposal.authors[0]?.fullName, proposal.institution].filter(Boolean).join(', ');
  return (
    <>
      {byline && <p className="text-sm text-gray-500">{byline}</p>}
      <p className="font-semibold text-navy">{proposal.title}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${barPercent}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        <span className="font-semibold text-navy">{raised}</span> of {goal}
      </p>
    </>
  );
}
