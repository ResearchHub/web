'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FUNDING_KIND_ICON } from '@/components/Funding/fundingKind';
import { cn } from '@/utils/styles';

/** The journal's display face, as the Journal and Peer Review heroes set it. */
export const DISPLAY_FONT: CSSProperties = {
  fontFamily: "'Cal Sans', var(--font-geist-sans), system-ui, sans-serif",
  textWrap: 'balance',
};

const HEADLINE = 'text-4xl font-bold leading-[1.05] tracking-[-0.032em] text-[#0b1530] sm:text-5xl';

/** A highlighted figure in a headline: blue for money given, green for money raised. */
export function HeadlineAmount({
  children,
  tone = 'giving',
}: {
  readonly children: ReactNode;
  readonly tone?: 'giving' | 'raising';
}) {
  return (
    <span className={tone === 'giving' ? 'text-primary-500' : 'text-emerald-600'}>{children}</span>
  );
}

/** One card in the hero's deck: a proposal or RFP the page is about, or a generic stand-in. */
export type HeroCover =
  | {
      readonly key: string;
      readonly title: string;
      /** Without a cover, the card shows its kind's colors and icon. */
      readonly image: string | null;
      /** A progress bar when still raising, otherwise a status line. */
      readonly percent?: number;
      readonly status: string;
      /** Green for proposals, blue for RFPs. */
      readonly tone?: 'green' | 'blue';
      readonly detail?: string;
    }
  | {
      readonly key: string;
      /** A generic card standing for a kind of document, for a deck with too little in it. */
      readonly generic: 'proposal' | 'rfp';
    };

/** The deck for someone with nothing of their own to show: one proposal, one RFP. */
export const GENERIC_COVERS: HeroCover[] = [
  { key: 'generic-proposal', generic: 'proposal' },
  { key: 'generic-rfp', generic: 'rfp' },
];

interface MyFundingHeroProps {
  readonly headline: ReactNode;
  readonly line?: ReactNode;
  readonly covers: readonly HeroCover[];
  /** The tab bar, which sits on the hero's bottom edge. */
  readonly tabs: ReactNode;
}

/**
 * The top of My Funding, in the family of the Journal and Peer Review heroes:
 * a statement of what the user has done in the journal's display face and the
 * work itself fanned out on the right. The deck takes the column the sidebar
 * has below, beside the headline and the tab bar alike, so it can be large
 * without making the header tall. It stays the same on every tab.
 */
export function MyFundingHero({ headline, line, covers, tabs }: MyFundingHeroProps) {
  return (
    <section aria-label="Your funding" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-[1012px] px-4 pt-10 tablet:!px-8 sm:pt-16">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-center">
            <h1 className={HEADLINE} style={DISPLAY_FONT}>
              {headline}
            </h1>
            {line && <p className="mt-4 text-lg text-gray-600">{line}</p>}
          </div>
          {/* Pulled up by the header's top padding, so the deck centers on the whole header. */}
          <div className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-6 lg:-mt-16 lg:flex lg:items-center lg:justify-end">
            <CoverDeck covers={covers} size="hero" />
          </div>
          <div className="mt-8 min-w-0 sm:mt-12 lg:col-start-1 lg:row-start-2 lg:self-end">
            {tabs}
          </div>
        </div>
      </div>
    </section>
  );
}

interface MyFundingWelcomeHeroProps {
  readonly line: ReactNode;
  readonly actions: ReactNode;
}

/**
 * The hero before there is anything to show, for someone who has not taken
 * part yet or has not signed in: what the page will hold, and where to start.
 */
export function MyFundingWelcomeHero({ line, actions }: MyFundingWelcomeHeroProps) {
  return (
    <section aria-label="My Funding" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-[1012px] px-4 py-12 tablet:!px-8 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className={HEADLINE} style={DISPLAY_FONT}>
              Fund the <HeadlineAmount>science</HeadlineAmount> you care about, or get yours funded.
            </h1>
            <p className="mt-4 text-lg text-gray-600">{line}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">{actions}</div>
          </div>
          <CoverDeck covers={GENERIC_COVERS} />
        </div>
      </div>
    </section>
  );
}

const FAN_POSITIONS = [
  'left-0 -rotate-[9deg] translate-y-4',
  'left-[110px] -rotate-1',
  'left-[218px] rotate-[7deg] translate-y-6',
];

/**
 * Up to three cards fanned like the Journal's issue cards. Wide screens only.
 * The deck is laid out at one size and scaled to fit where it sits: beside the
 * welcome's headline, or in the signed-in header's right-hand column.
 */
export const DECK_SIZE = {
  full: { box: 'h-[260px] w-[364px]', scale: 'scale-[0.866]' },
  hero: { box: 'h-[246px] w-[345px]', scale: 'scale-[0.82]' },
} as const;

function CoverDeck({
  covers,
  size = 'full',
}: {
  readonly covers: readonly HeroCover[];
  readonly size?: keyof typeof DECK_SIZE;
}) {
  const shown = covers.slice(0, 3);
  if (shown.length === 0) return null;
  // One card sits in the middle; two take the outer places.
  const places = shown.length === 1 ? [1] : shown.length === 2 ? [0, 2] : [0, 1, 2];
  const { box, scale } = DECK_SIZE[size];
  return (
    <div aria-hidden="true" className={cn('relative hidden flex-shrink-0 lg:block', box)}>
      <div className={cn('absolute left-0 top-0 h-[300px] w-[420px] origin-top-left', scale)}>
        <div className="absolute left-10 top-10 h-[240px] w-[340px] -rotate-6 rounded-[3rem] bg-primary-500/20 blur-2xl" />
        {shown.map((cover, index) => (
          <div
            key={cover.key}
            className={cn('absolute top-6 w-[200px]', FAN_POSITIONS[places[index]])}
          >
            {'generic' in cover ? (
              <GenericCard kind={cover.generic} />
            ) : (
              <CoverCard cover={cover} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One proposal or RFP in the deck, the size of a generic card so the deck reads as one set. */
function CoverCard({ cover }: { readonly cover: Exclude<HeroCover, { generic: unknown }> }) {
  const blue = cover.tone === 'blue';
  return (
    <div className="flex h-[232px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
      <div className="relative h-28 shrink-0 bg-gray-900">
        {cover.image ? (
          <Image src={cover.image} alt="" fill className="object-cover" sizes="200px" />
        ) : (
          // No cover: the kind's own colors and icon, as the generic cards have them.
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gradient-to-br text-white',
              blue
                ? 'from-primary-400 via-primary-500 to-primary-700'
                : 'from-emerald-400 via-emerald-500 to-emerald-700'
            )}
          >
            <FontAwesomeIcon
              icon={FUNDING_KIND_ICON[blue ? 'rfp' : 'proposal']}
              className="h-9 w-9 drop-shadow"
            />
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 px-3.5 pb-3.5 pt-3">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">
          {cover.title}
        </p>
        {cover.percent != null && (
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${cover.percent}%` }}
            />
          </div>
        )}
        <p
          className={cn(
            'flex items-center gap-1.5 text-[11px] font-semibold',
            cover.percent != null
              ? 'mt-1.5 text-gray-600'
              : blue
                ? 'mt-2.5 text-primary-700'
                : 'mt-2.5 text-emerald-700'
          )}
        >
          {cover.percent == null && (
            <span
              className={cn('h-1.5 w-1.5 rounded-full', blue ? 'bg-primary-500' : 'bg-emerald-500')}
            />
          )}
          {cover.status}
        </p>
        {cover.detail && <p className="mt-0.5 text-[11px] text-gray-500">{cover.detail}</p>}
      </div>
    </div>
  );
}

/** The Publish menu's icons, so a stand-in card names the same thing the menu starts. */
const GENERIC = {
  proposal: {
    icon: FUNDING_KIND_ICON.proposal,
    eyebrow: 'Proposal',
    title: 'Get your research funded',
    surface:
      'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 ring-emerald-700/30 shadow-emerald-900/30',
  },
  rfp: {
    icon: FUNDING_KIND_ICON.rfp,
    eyebrow: 'Request for proposals',
    title: 'Fund the research you want',
    surface:
      'bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 ring-primary-700/30 shadow-primary-900/30',
  },
} as const;

/** A stand-in card in the Journal's issue-card style: green for a proposal, blue for an RFP. */
function GenericCard({ kind }: { readonly kind: 'proposal' | 'rfp' }) {
  const { icon, eyebrow, title, surface } = GENERIC[kind];
  return (
    <div
      className={cn(
        'relative flex h-[232px] flex-col overflow-hidden rounded-2xl p-4 text-white shadow-2xl ring-1',
        surface
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
        {eyebrow}
      </p>
      <div className="relative flex flex-1 items-center justify-center">
        <FontAwesomeIcon icon={icon} className="h-12 w-12 drop-shadow-lg" />
      </div>
      <p className="relative text-lg font-bold leading-tight tracking-tight">{title}</p>
    </div>
  );
}
