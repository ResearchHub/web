import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { isLightSet, type SetId } from '../theme';
import { SET_INFO } from '../sets/registry';
import { DEFAULT_HERO, HERO_INFO, type HeroId } from '../sets/heroes';
import { HeroFigure } from './Figure';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { BackButton } from './BackButton';
import { HeroCard } from './HeroCard';
import type { RfpView } from '../data/rfp';

/**
 * A quiet "Talk to us" link beside the hero's buttons, pointing to the Talk
 * to us section. On trial (Kobe, 2026-11-17): set to false to remove it.
 */
const SHOW_TALK_LINK = false;

/**
 * The hero's two buttons, filling the card's width. Narrow screens drop the
 * icons so both labels fit side by side; from tablet up the two are equal.
 */
const CARD_CTA =
  'flex-auto px-3 text-[13.5px] !gap-1.5 min-[380px]:text-[14px] [&>svg]:hidden tablet:flex-1 tablet:text-[15px] min-[900px]:[&>svg]:block';

export function Hero({
  set = 'ink',
  hero = DEFAULT_HERO,
  rfp,
}: {
  set?: SetId;
  hero?: HeroId;
  rfp: RfpView;
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
        <div className="-ml-2.5 flex items-center gap-1">
          <BackButton />
          <Link href="/" aria-label="ResearchHub home" className="flex h-10 items-center">
            <Logo size={30} variant={isLightSet(set) ? undefined : 'white'} />
          </Link>
        </div>
        <a
          href="#how-it-works"
          className="whitespace-nowrap text-[14.5px] font-medium text-[var(--o-text)] underline decoration-[color:var(--o-line-2)] underline-offset-4 hover:decoration-current"
        >
          <span className="tablet:hidden">Our process</span>
          <span className="hidden tablet:inline">Learn about our process</span>
        </a>
      </header>

      {/* On phones the figure takes the top 40% of min(hero height, 2.16 ×
          width) (`phoneArt` in sets/poster/heroKit.ts), so the text starts at
          least that far down: 40svh alone puts the headline on the figure
          wherever the browser's bars make the viewport short. */}
      <div className="relative z-10 mt-auto px-5 pb-12 pt-[max(40svh,min(86.4vw,380px))] tablet:my-auto tablet:w-[min(760px,62%)] tablet:px-10 tablet:py-24 content-lg:px-16">
        <h1
          id="orch-title"
          className="o-rise o-serif max-w-[11em] text-balance text-[clamp(34px,4.4vw,64px)] leading-[1.02]"
        >
          Fund the experiments that could explain <em>consciousness.</em>
        </h1>

        <p className="o-rise o-prose mt-6 max-w-[33em] text-[16px] tablet:text-[17.5px]">
          Could an AI be conscious? Does experience need quantum physics? We are raising funds to
          test the leading theories of how consciousness arises.
        </p>

        <HeroCard rfp={rfp}>
          <div data-orch-hero-cta className="mt-5 flex flex-wrap gap-3">
            {/* Side by side on phones too, stacking only where the two cannot
                fit (under about 350px). No Share, Save or More here (Kobe,
                2026-11-17): the RFP page keeps them. */}
            <div className="flex w-full flex-wrap gap-2 tablet:gap-3">
              <AddToPoolButton size="lg" className={CARD_CTA} />
              <SubmitProposalButton size="lg" className={CARD_CTA} />
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
        </HeroCard>
      </div>

      <p className="absolute bottom-6 right-8 z-10 hidden max-w-[300px] text-right text-[12px] leading-[1.5] text-[var(--o-mute)] content-md:block">
        {set === 'poster'
          ? HERO_INFO[hero].caption
          : `A microtubule, drawn schematically. ${words.a} and ${words.b}: two states at once. ${words.w}: a collapse.`}
      </p>
    </section>
  );
}
