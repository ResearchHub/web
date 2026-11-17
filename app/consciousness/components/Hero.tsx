import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { isLightSet, type SetId } from '../theme';
import { SET_INFO } from '../sets/registry';
import { DEFAULT_HERO, HERO_INFO, type HeroId } from '../sets/heroes';
import { ORCH_OR_RFP } from '../data/mockRfp';
import { HeroFigure } from './Figure';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { RfpMenu } from './RfpMenu';
import { HeroPool } from './PoolPanel';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';

/**
 * A quiet "Talk to us" link beside the hero's buttons, pointing to the Talk
 * to us section. On trial (Kobe, 2026-11-17): set to false to remove it.
 */
const SHOW_TALK_LINK = true;

export function Hero({
  set = 'ink',
  hero = DEFAULT_HERO,
  work = null,
  metadata = null,
}: {
  set?: SetId;
  hero?: HeroId;
  work?: Work | null;
  metadata?: WorkMetadata | null;
}) {
  const rfp = ORCH_OR_RFP;
  const words = SET_INFO[set].words;
  const proposals = rfp.proposals.length;

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

      <Link
        href="/"
        aria-label="ResearchHub home"
        className="absolute left-5 top-5 z-10 flex h-10 items-center tablet:left-10 tablet:top-6 content-lg:left-16"
      >
        <Logo size={30} variant={isLightSet(set) ? undefined : 'white'} />
      </Link>

      <div className="relative z-10 mt-auto px-5 pb-12 pt-[40svh] tablet:my-auto tablet:w-[min(760px,62%)] tablet:px-10 tablet:py-24 content-lg:px-16">
        <h1
          id="orch-title"
          className="o-rise o-serif max-w-[11em] text-balance text-[clamp(34px,4.4vw,64px)] leading-[1.02]"
        >
          How does a brain make a mind? <em className="block">Fund the experiments.</em>
        </h1>

        <p className="o-rise o-prose mt-6 max-w-[33em] text-[16px] tablet:text-[17.5px]">
          Could an AI be conscious? Does experience need quantum physics? Six open questions have
          experiments that could answer them, and few have been run. Every dollar in the pool pays
          for them, <span className="text-[var(--o-text)]">whichever answer they favour.</span>
        </p>

        <div data-orch-cta className="o-rise mt-7 flex flex-wrap gap-3">
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

        <HeroPool proposals={proposals} />
      </div>

      <p className="absolute bottom-6 right-8 z-10 hidden max-w-[300px] text-right text-[12px] leading-[1.5] text-[var(--o-mute)] content-md:block">
        {set === 'poster'
          ? HERO_INFO[hero].caption
          : `A microtubule, drawn schematically. ${words.a} and ${words.b}: two states at once. ${words.w}: a collapse.`}
      </p>
    </section>
  );
}
