import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { isLightSet, type SetId } from '../theme';
import { SET_INFO } from '../sets/registry';
import { DEFAULT_HERO, HERO_INFO, type HeroId } from '../sets/heroes';
import { HeroFigure } from './Figure';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { RfpMenu } from './RfpMenu';
import { PhaseBox, StatusPill, headline, type BoxId, type HeadlineId } from './HeroVariants';
import { daysLeft } from './PoolPanel';
import { ORCH_OR_RFP } from '../data/mockRfp';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';

/**
 * A quiet "Talk to us" link beside the hero's buttons, pointing to the Talk
 * to us section. On trial (Kobe, 2026-11-17): set to false to remove it.
 */
const SHOW_TALK_LINK = false;

/**
 * The hero's text: headline, line, buttons and the phase box. `box` and
 * `headlineId` pick a mock treatment (HeroVariants.tsx); the mocks page
 * renders this same column for each one.
 */
export function HeroCopy({
  box = 'A',
  headlineId = '1',
  work = null,
  metadata = null,
  titleId,
}: {
  box?: BoxId;
  headlineId?: HeadlineId;
  work?: Work | null;
  metadata?: WorkMetadata | null;
  titleId?: string;
}) {
  const h = headline(headlineId);
  return (
    <>
      {box === 'F' && <StatusPill />}
      <h1
        id={titleId}
        className="o-rise o-serif max-w-[11em] text-balance text-[clamp(34px,4.4vw,64px)] leading-[1.02]"
      >
        {h.lead} <em className="block">{h.emph}</em>
      </h1>

      <p className="o-rise o-prose mt-6 max-w-[33em] text-[16px] tablet:text-[17.5px]">
        Could an AI be conscious? Does experience need quantum physics? We are raising funds to test
        the leading theories of how consciousness arises.
      </p>

      <div data-orch-hero-cta className="o-rise mt-7 flex flex-wrap gap-3">
        <AddToPoolButton size="lg" />
        <SubmitProposalButton size="lg" />
        <div className="flex gap-2 tablet:ml-1">
          <RfpMenu work={work} metadata={metadata} />
        </div>
        {SHOW_TALK_LINK && (
          <a
            href="#talk-to-us"
            data-talk-link
            className="flex h-12 items-center gap-2 px-2 text-[14.5px] text-[var(--o-soft)] underline decoration-[color:var(--o-line-2)] underline-offset-4 hover:text-[var(--o-text)] hover:decoration-current"
          >
            <MessageCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
            Talk to us
          </a>
        )}
      </div>

      <PhaseBox box={box} daysLeft={daysLeft(ORCH_OR_RFP.pool.goalBy)} />
    </>
  );
}

export function Hero({
  set = 'ink',
  hero = DEFAULT_HERO,
  box = 'A',
  headlineId = '1',
  work = null,
  metadata = null,
}: {
  set?: SetId;
  hero?: HeroId;
  box?: BoxId;
  headlineId?: HeadlineId;
  work?: Work | null;
  metadata?: WorkMetadata | null;
}) {
  const words = SET_INFO[set].words;

  return (
    <section
      aria-labelledby="orch-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroFigure set={set} hero={hero} />
      {/* Scrims so the type always reads over the figure: from below on
          phones, from the left on wider screens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--o-ink-rgb)/0)_22%,rgb(var(--o-ink-rgb)/0.85)_44%,var(--o-ink)_62%)] tablet:bg-[linear-gradient(90deg,var(--o-ink)_0%,rgb(var(--o-ink-rgb)/0.85)_30%,rgb(var(--o-ink-rgb)/0)_54%),linear-gradient(0deg,var(--o-ink)_0%,rgb(var(--o-ink-rgb)/0)_22%)]"
      />
      <div aria-hidden className="o-grain" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 pt-5 tablet:px-10 tablet:pt-6 content-lg:px-16">
        <Link href="/" aria-label="ResearchHub home" className="flex h-10 items-center">
          <Logo size={30} variant={isLightSet(set) ? undefined : 'white'} />
        </Link>
        <a
          href="#how-it-works"
          className="text-[14.5px] font-medium text-[var(--o-text)] underline decoration-[color:var(--o-line-2)] underline-offset-4 hover:decoration-current"
        >
          Learn about our process
        </a>
      </header>

      <div className="relative z-10 mt-auto px-5 pb-12 pt-[40svh] tablet:my-auto tablet:w-[min(760px,62%)] tablet:px-10 tablet:py-24 content-lg:px-16">
        <HeroCopy
          box={box}
          headlineId={headlineId}
          work={work}
          metadata={metadata}
          titleId="orch-title"
        />
      </div>

      <p className="absolute bottom-6 right-8 z-10 hidden max-w-[300px] text-right text-[12px] leading-[1.5] text-[var(--o-mute)] content-md:block">
        {set === 'poster'
          ? HERO_INFO[hero].caption
          : `A microtubule, drawn schematically. ${words.a} and ${words.b}: two states at once. ${words.w}: a collapse.`}
      </p>
    </section>
  );
}
