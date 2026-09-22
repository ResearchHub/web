'use client';

import { useState, type ReactNode } from 'react';
import { BadgeCheck, Handshake, Target, X, type LucideIcon } from 'lucide-react';
import { WHITE_GLOVE_BOOKING_URL } from '@/components/Funding/OpenFundingOpportunityModal';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { SelectFundingOpportunityModal } from '@/components/modals/SelectFundingOpportunityModal';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { useUser } from '@/contexts/UserContext';
import type { SelectedGrantDetails } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';

interface IntentCtasProps {
  readonly intent: FundingIntent;
  /** The RFP the user means to apply to, chosen before the conversation exists. */
  readonly selectedGrant: SelectedGrantDetails | null;
  readonly onSelectGrant: (grant: SelectedGrantDetails | null) => void;
}

/**
 * What sits under the composer on a new conversation: for a researcher, the
 * two things that make the assistant's draft theirs — their profile and the
 * RFP they are answering; for a funder, a way to the team.
 */
export function IntentCtas({ intent, selectedGrant, onSelectGrant }: IntentCtasProps) {
  if (intent === 'fund') {
    return (
      <a
        href={WHITE_GLOVE_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 self-start px-1 text-sm text-gray-600"
      >
        <Handshake className="h-4 w-4 text-primary-700" aria-hidden="true" />
        Prefer to talk it through?
        <span className="font-semibold text-primary-700 underline underline-offset-[3px]">
          Talk to the ResearchHub team
        </span>
      </a>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 tablet:!grid-cols-2">
      <ConnectProfileCta />
      <ApplyToRfpCta selectedGrant={selectedGrant} onSelectGrant={onSelectGrant} />
    </div>
  );
}

function ConnectProfileCta() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const authorId = user?.authorProfile?.id;
  const connected = Boolean(
    user?.authorProfile?.isOrcidConnected || user?.authorProfile?.googleScholar
  );

  return (
    <>
      <CtaCard
        icon={BadgeCheck}
        title={connected ? 'Researcher profile connected' : 'Connect your researcher profile'}
        description="Bring in your publications and affiliation so the draft starts from your record."
        onClick={() => setOpen(true)}
        disabled={authorId == null}
      />
      {authorId != null && (
        <ProfileEditModal
          isOpen={open}
          onClose={() => setOpen(false)}
          authorId={authorId}
          fields={['social_links']}
          socialLinks={['orcid_id', 'google_scholar']}
          title="Connect your researcher profile"
          description="Add one or both so funders can see your track record."
          maxWidth="max-w-lg"
        />
      )}
    </>
  );
}

function ApplyToRfpCta({
  selectedGrant,
  onSelectGrant,
}: Pick<IntentCtasProps, 'selectedGrant' | 'onSelectGrant'>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {selectedGrant ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-3">
          <Target className="h-[18px] w-[18px] shrink-0 text-emerald-700" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              Applying to
            </span>
            <span className="truncate text-sm font-semibold text-gray-900">
              {selectedGrant.shortTitle}
            </span>
            <span className="text-xs text-gray-600">
              {selectedGrant.organization} · {formatCompactAmount(selectedGrant.fundingAmount)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onSelectGrant(null)}
            aria-label="Remove RFP"
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <CtaCard
          icon={Target}
          title="Apply to a specific RFP"
          description="Pick an open RFP and draft a proposal that fits what the funder asked for."
          onClick={() => setOpen(true)}
        />
      )}
      <SelectFundingOpportunityModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={onSelectGrant}
      />
    </>
  );
}

function CtaCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
}: {
  readonly icon: LucideIcon;
  readonly title: ReactNode;
  readonly description: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <span className="text-xs leading-relaxed text-gray-600">{description}</span>
      </span>
    </button>
  );
}
