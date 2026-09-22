'use client';

import { useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogleScholar, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { Handshake, Plug, Plus, Target, X, type LucideIcon } from 'lucide-react';
import { WHITE_GLOVE_BOOKING_URL } from '@/components/Funding/OpenFundingOpportunityModal';
import { SelectFundingOpportunityModal } from '@/components/modals/SelectFundingOpportunityModal';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { useUser } from '@/contexts/UserContext';
import type { SelectedGrantDetails } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import { cn } from '@/utils/styles';

interface StartContextChipsProps {
  /** The RFP the user means to apply to, chosen before the conversation exists. */
  readonly selectedGrant: SelectedGrantDetails | null;
  readonly onSelectGrant: (grant: SelectedGrantDetails | null) => void;
}

/**
 * The two things that make the assistant's draft a researcher's own, seated
 * in the composer's toolbar like attachments: their profile and the RFP they
 * are answering. Each starts as a dashed "add" chip and fills in once set.
 */
export function StartContextChips({ selectedGrant, onSelectGrant }: StartContextChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ProfileChip />
      <RfpChip selectedGrant={selectedGrant} onSelectGrant={onSelectGrant} />
    </div>
  );
}

/** For a funder there is nothing to attach; the way to the team sits under the composer instead. */
export function FundTeamLink() {
  return (
    <a
      href={WHITE_GLOVE_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 px-1 text-sm text-gray-600"
    >
      <Handshake className="h-4 w-4 text-primary-700" aria-hidden="true" />
      Prefer to talk it through?
      <span className="font-semibold text-primary-700 underline underline-offset-[3px]">
        Talk to the ResearchHub team
      </span>
    </a>
  );
}

/** The services a profile can be connected to, in the order the chip names them. */
const PROFILE_SOURCES = [
  { key: 'scholar', label: 'Scholar', icon: faGoogleScholar, colorClass: 'text-[#4285F4]' },
  { key: 'orcid', label: 'ORCID', icon: faOrcid, colorClass: 'text-orcid-500' },
] as const;

function ProfileChip() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const profile = user?.authorProfile;
  const authorId = profile?.id;
  const connected = PROFILE_SOURCES.filter(({ key }) =>
    key === 'scholar' ? Boolean(profile?.googleScholar) : Boolean(profile?.isOrcidConnected)
  );

  return (
    <>
      <Chip
        set={connected.length > 0}
        leading={
          connected.length > 0 ? (
            <SourceLogos sources={connected} />
          ) : (
            <Plug className="h-3 w-3 shrink-0 text-gray-500" aria-hidden="true" />
          )
        }
        label={
          connected.length > 0
            ? connected.map(({ label }) => label).join(', ')
            : 'Researcher profile'
        }
        title={
          connected.length > 0 ? 'Edit your researcher profile' : 'Connect your researcher profile'
        }
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
          description="Connecting your profile will provide the AI model with more context about your expertise."
          showSectionTitles={false}
          maxWidth="max-w-lg"
        />
      )}
    </>
  );
}

/** The connected services' logos, overlapped like an avatar stack when there are two. */
function SourceLogos({
  sources,
}: {
  readonly sources: readonly (typeof PROFILE_SOURCES)[number][];
}) {
  return (
    <span className="flex shrink-0 items-center" aria-hidden="true">
      {sources.map((source, index) => (
        <span
          key={source.key}
          className={cn(
            'flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white ring-1 ring-emerald-100',
            index > 0 && '-ml-1'
          )}
          style={{ zIndex: sources.length - index }}
        >
          <FontAwesomeIcon icon={source.icon} className={cn('h-3 w-3', source.colorClass)} />
        </span>
      ))}
    </span>
  );
}

function RfpChip({ selectedGrant, onSelectGrant }: StartContextChipsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {selectedGrant ? (
        <Chip
          icon={Target}
          set
          label={`${selectedGrant.shortTitle} · ${selectedGrant.organization} · ${formatCompactAmount(selectedGrant.fundingAmount)}`}
          title="Change the RFP"
          onClick={() => setOpen(true)}
          onRemove={() => onSelectGrant(null)}
          removeLabel="Remove RFP"
        />
      ) : (
        <Chip
          icon={Plus}
          label="Apply to RFP"
          title="Pick an open RFP to apply to"
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

function Chip({
  icon: Icon,
  leading,
  label,
  title,
  set = false,
  onClick,
  onRemove,
  removeLabel,
  disabled = false,
}: {
  /** A lucide glyph before the label, coloured with the chip. */
  readonly icon?: LucideIcon;
  /** Anything else before the label, drawn as given — the connected services' logos. */
  readonly leading?: ReactNode;
  readonly label: ReactNode;
  readonly title: string;
  /** Filled in, in the receiving money's colour, rather than an outlined "add". */
  readonly set?: boolean;
  readonly onClick: () => void;
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
  readonly disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        // A long RFP title truncates rather than pushing the send button off the row.
        'inline-flex h-7 min-w-0 max-w-[300px] items-center rounded-full border text-xs font-medium transition-colors',
        set
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-dashed border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50',
        disabled && 'opacity-60'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
          'flex h-full min-w-0 items-center gap-1 rounded-full pl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed',
          onRemove ? 'pr-0.5' : 'pr-2.5'
        )}
      >
        {leading}
        {Icon && (
          <Icon
            className={cn('h-3 w-3 shrink-0', set ? 'text-emerald-700' : 'text-gray-500')}
            aria-hidden="true"
          />
        )}
        <span className="truncate">{label}</span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
