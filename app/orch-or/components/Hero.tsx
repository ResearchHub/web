import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { isLightSet, type SetId } from '../theme';
import { SET_INFO } from '../sets/registry';
import { DEFAULT_HERO, HERO_INFO, type HeroId } from '../sets/heroes';
import { ORCH_OR_RFP, deadlineLabel, formatUsd, poolTotalUsd } from '../data/mockRfp';
import { HeroFigure } from './Figure';
import { FunderMark } from './FunderMark';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
import { RfpMenu } from './RfpMenu';
import { HeroPool } from './PoolPanel';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';

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
        <p className="o-rise flex items-center gap-3 text-[14px] text-[var(--o-soft)]">
          <FunderMark size={30} />
          <span>
            A request for proposals from the{' '}
            <span className="text-[var(--o-text)]">{rfp.funder.name}</span>
          </span>
        </p>

        <h1
          id="orch-title"
          className="o-rise o-serif mt-6 max-w-[10.5em] text-balance text-[clamp(34px,4.4vw,64px)] leading-[1.02]"
        >
          Is consciousness a quantum process? <em className="block">Help settle it.</em>
        </h1>

        <p className="o-rise o-prose mt-6 max-w-[33em] text-[16px] tablet:text-[17.5px]">
          Orch OR says moments of experience are quantum collapses in the microtubules of neurons.
          The experiments that could settle it have barely been run. This call funds them,{' '}
          <span className="text-[var(--o-text)]">whichever way they point.</span>
        </p>

        <div data-orch-cta className="o-rise mt-7 flex flex-wrap gap-3">
          <SubmitProposalButton size="lg" />
          <AddToPoolButton size="lg" />
          <div className="flex gap-2 tablet:ml-1">
            <RfpMenu work={work} metadata={metadata} />
          </div>
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
