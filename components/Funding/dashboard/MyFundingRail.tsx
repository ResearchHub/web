'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Building2, Star, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Money, SupportedPerson } from '@/components/Funding/dashboard/lib/myFundingModel';
import { useMoneyFormat } from '@/components/Funding/dashboard/lib/useMoneyFormat';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import type { AuthorProfile } from '@/types/authorProfile';
import type { SupportedInstitution } from '@/types/funder';
import { cn } from '@/utils/styles';

/** How many people or institutions a section lists before "See all". */
const SHOWN = 4;

function RailSection({
  title,
  action,
  children,
}: {
  readonly title: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SeeAll({ onClick, count }: { readonly onClick: () => void; readonly count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
    >
      See all {count}
    </button>
  );
}

/**
 * Empty slots in place of a list with nothing in it yet: dashed avatars (or
 * institution tiles) beside blank lines, still, so they read as room to fill
 * rather than as something loading.
 */
function RailPlaceholder({ kind }: { readonly kind: 'person' | 'institution' }) {
  const Icon = kind === 'person' ? UserRound : Building2;
  return (
    <ul className="space-y-2.5" aria-label="Nothing here yet">
      {['w-28', 'w-20'].map((width) => (
        <li key={width} className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-dashed border-gray-300 text-gray-300',
              kind === 'person' ? 'rounded-full' : 'rounded-lg'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className={cn('h-2.5 rounded-full bg-gray-200/80', width)} />
        </li>
      ))}
    </ul>
  );
}

function PersonRow({
  profile,
  detail,
  amount,
}: {
  readonly profile: AuthorProfile;
  readonly detail?: string;
  readonly amount?: string;
}) {
  return (
    <li>
      <Link
        href={`/author/${profile.id}`}
        className="flex items-center gap-2.5 rounded-lg py-1.5 hover:bg-gray-100/70"
      >
        <Avatar src={profile.profileImage} alt={profile.fullName} size={30} disableTooltip />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900">
            {profile.fullName}
          </span>
          {detail && <span className="block truncate text-xs text-gray-500">{detail}</span>}
        </span>
        {amount && (
          <span className="shrink-0 font-mono text-xs font-semibold text-gray-900">{amount}</span>
        )}
      </Link>
    </li>
  );
}

/** The scientists the user backs, the most backed first, with the proposal and amount behind each. */
function PeopleYouSupport({
  people,
  onShowAll,
}: {
  readonly people: readonly SupportedPerson[];
  readonly onShowAll: () => void;
}) {
  const format = useMoneyFormat();
  return (
    <RailSection
      title="People you support"
      action={people.length > SHOWN && <SeeAll onClick={onShowAll} count={people.length} />}
    >
      {people.length === 0 ? (
        <RailPlaceholder kind="person" />
      ) : (
        <ul>
          {people.slice(0, SHOWN).map((person) => (
            <PersonRow
              key={person.profile.id}
              profile={person.profile}
              detail={person.proposalTitle}
              amount={format(person.youGave, { shorten: true })}
            />
          ))}
        </ul>
      )}
    </RailSection>
  );
}

/** The institutions the user's funding reached. */
function InstitutionsYouSupport({
  institutions,
}: {
  readonly institutions: readonly SupportedInstitution[];
}) {
  const rest = institutions.length - SHOWN;
  return (
    <RailSection title="Institutions you support">
      {institutions.length === 0 && <RailPlaceholder kind="institution" />}
      <ul className="space-y-2 empty:hidden">
        {institutions.slice(0, SHOWN).map((institution) => (
          <li key={institution.id} className="flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 ring-1 ring-gray-200">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-gray-900">{institution.name}</span>
              {institution.city && (
                <span className="block truncate text-xs text-gray-500">
                  {institution.city}
                  {institution.countryCode ? `, ${institution.countryCode}` : ''}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {rest > 0 && <p className="mt-2 text-xs text-gray-500">and {rest} more</p>}
    </RailSection>
  );
}

/** The people backing the user's own proposals. */
function YourFunders({
  funders,
  onShowAll,
}: {
  readonly funders: readonly AuthorProfile[];
  readonly onShowAll: () => void;
}) {
  return (
    <RailSection
      title="Your funders"
      action={funders.length > SHOWN && <SeeAll onClick={onShowAll} count={funders.length} />}
    >
      {funders.length === 0 ? (
        <RailPlaceholder kind="person" />
      ) : (
        <ul>
          {funders.slice(0, SHOWN).map((funder) => (
            <PersonRow key={funder.id} profile={funder} />
          ))}
        </ul>
      )}
    </RailSection>
  );
}

/** Where a line with nothing on it yet points: a page, or a new draft. */
type MoneyLineStart =
  | { readonly label: string; readonly href: string }
  | { readonly label: string; readonly draft: FundingIntent };

interface MoneyLine {
  readonly label: string;
  readonly detail?: string;
  readonly amount: Money;
  readonly kind: 'given' | 'raised' | 'reviews';
  /** Shown in place of the amount while it is zero. */
  readonly start?: MoneyLineStart;
}

const LINE_ICON = {
  given: { Icon: ArrowUpRight, tint: 'bg-primary-50 text-primary-600' },
  raised: { Icon: ArrowDownLeft, tint: 'bg-emerald-50 text-emerald-700' },
  reviews: { Icon: Star, tint: 'bg-amber-50 text-amber-700' },
} as const;

const isZero = (amount: Money) => amount.usd === 0 && amount.rsc === 0;

const START_LINK = 'shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700';

/** Money in and out: what the user gave, raised and earned reviewing, in one place. */
function MoneyInAndOut({ lines }: { readonly lines: readonly MoneyLine[] }) {
  const format = useMoneyFormat();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { startNew } = useFundingDrafting();
  return (
    <RailSection title="Money in and out">
      <ul className="space-y-3">
        {lines.map((line) => {
          const { Icon, tint } = LINE_ICON[line.kind];
          const { start } = line;
          return (
            <li key={line.label} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  tint
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-gray-900">{line.label}</span>
                {line.detail && (
                  <span className="block truncate text-xs text-gray-500">{line.detail}</span>
                )}
              </span>
              {start && isZero(line.amount) ? (
                'href' in start ? (
                  <Link href={start.href} className={START_LINK}>
                    {start.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => executeAuthenticatedAction(() => startNew(start.draft))}
                    className={START_LINK}
                  >
                    {start.label}
                  </button>
                )
              ) : (
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {format(line.amount)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </RailSection>
  );
}

/** The rail's sections, divided the way the Journal's sidebar divides its own. */
function RailSections({ children }: { readonly children: ReactNode }) {
  return <div className="divide-y divide-gray-200">{children}</div>;
}

const ZERO: Money = { usd: 0, rsc: 0 };

interface MyFundingRailProps {
  readonly given?: Money;
  /** What others added to the user's gifts by matching them. */
  readonly matched?: Money;
  readonly raised?: Money;
  readonly reviewEarned?: Money;
  readonly people?: readonly SupportedPerson[];
  readonly institutions?: readonly SupportedInstitution[];
  readonly funders?: readonly AuthorProfile[];
  readonly onShowAll?: (list: 'scientists' | 'funders') => void;
}

/**
 * The right rail, the same for everyone: money in and out, the people and
 * institutions the user supports, their funders, and paid reviewing. A
 * section with nothing in it yet shows empty slots, and money not yet moved
 * shows where to start, so the rail sells the page to someone new as well as
 * summing it up for someone who has taken part.
 */
export function MyFundingRail({
  given = ZERO,
  matched,
  raised = ZERO,
  reviewEarned = ZERO,
  people = [],
  institutions = [],
  funders = [],
  onShowAll = () => undefined,
}: MyFundingRailProps) {
  const format = useMoneyFormat();
  return (
    <RailSections>
      <MoneyInAndOut
        lines={[
          {
            kind: 'given',
            label: 'You gave',
            detail:
              matched && !isZero(matched)
                ? `+ ${format(matched, { shorten: true })} matched by others`
                : undefined,
            amount: given,
            start: { label: 'Back a proposal', href: '/fund/proposals' },
          },
          {
            kind: 'raised',
            label: 'You raised',
            amount: raised,
            start: { label: 'Open a proposal', draft: 'need_funding' },
          },
          // Paid reviewing has its own section below until it has earned something.
          ...(isZero(reviewEarned)
            ? []
            : [{ kind: 'reviews' as const, label: 'Peer reviews', amount: reviewEarned }]),
        ]}
      />
      <PeopleYouSupport people={people} onShowAll={() => onShowAll('scientists')} />
      <InstitutionsYouSupport institutions={institutions} />
      <YourFunders funders={funders} onShowAll={() => onShowAll('funders')} />
      <PaidReviewsTeaser />
    </RailSections>
  );
}

/** The rail's shape while the page works out what goes in it. */
export function MyFundingRailSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-200" aria-hidden="true">
      {[3, 2, 2, 2, 1].map((rows, index) => (
        <div key={index} className="py-4 first:pt-0 last:pb-0">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="mt-3 space-y-3">
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="flex items-center gap-2.5">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                <div className="h-3.5 flex-1 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The one way to take part that needs no money. */
function PaidReviewsTeaser() {
  return (
    <RailSection title="Get paid to review">
      <p className="text-sm leading-relaxed text-gray-600">
        Peer-review research proposals and earn from open bounties. What you earn shows up under
        Money in and out.
      </p>
      <Link
        href="/peer-review"
        className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        Open bounties
      </Link>
    </RailSection>
  );
}
