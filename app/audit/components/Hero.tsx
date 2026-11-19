import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { BackButton } from '@/app/consciousness/components/BackButton';
import { AddToPoolButton, SubmitProposalButton } from './Actions';
import { HeroArt } from './HeroArt';
import { HeroCard } from './HeroCard';
import { Ref } from './Parts';
import type { RfpView } from '../data/rfp';

/**
 * The hero's two buttons, filling the card's width. Narrow screens drop the
 * icons so both labels fit side by side; from tablet up the two are equal.
 */
const CARD_CTA =
  'flex-auto px-3 text-[13.5px] !gap-1.5 min-[380px]:text-[14px] [&>svg]:hidden tablet:flex-1 tablet:text-[15px] min-[900px]:[&>svg]:block';

/**
 * The same hero as /consciousness, in this page's own style: back and home
 * at the top left, the process link at the top right, the headline, one
 * paragraph, and the card with the pool and both buttons. The figure is 3D
 * and sits behind: right of the text on wide screens, above it on phones.
 */
export function Hero({ rfp }: { rfp: RfpView }) {
  return (
    <section
      aria-labelledby="audit-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroArt />
      {/* Scrims so the type always reads over the figure: from below on
          phones, from the left on wider screens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--a-paper-rgb)/0.92)_0%,rgb(var(--a-paper-rgb)/0)_13%,rgb(var(--a-paper-rgb)/0)_20%,rgb(var(--a-paper-rgb)/0.92)_33%,var(--a-paper)_42%)] tablet:bg-[linear-gradient(90deg,var(--a-paper)_0%,rgb(var(--a-paper-rgb)/0.9)_26%,rgb(var(--a-paper-rgb)/0)_50%),linear-gradient(0deg,var(--a-paper)_0%,rgb(var(--a-paper-rgb)/0)_14%)]"
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 pt-5 tablet:px-10 tablet:pt-6 content-lg:px-16">
        <div className="-ml-2.5 flex items-center gap-1 [--o-text-rgb:var(--a-ink-rgb)] [--o-text:var(--a-ink)]">
          <BackButton />
          <Link href="/" aria-label="ResearchHub home" className="flex h-10 items-center">
            <Logo size={30} />
          </Link>
        </div>
        <a
          href="#how-it-works"
          className="whitespace-nowrap text-[14.5px] font-medium text-[var(--a-ink)] underline decoration-[color:var(--a-line-2)] underline-offset-4 hover:decoration-current"
        >
          <span className="tablet:hidden">Our process</span>
          <span className="hidden tablet:inline">Learn about our process</span>
        </a>
      </header>

      <div className="relative z-10 mt-auto px-5 pb-12 pt-[max(33svh,min(70vw,300px))] tablet:my-auto tablet:w-[min(780px,62%)] tablet:px-10 tablet:py-24 content-lg:px-16">
        <h1
          id="audit-title"
          className="a-rise a-serif max-w-[10.5em] text-[clamp(38px,4.9vw,72px)] leading-[0.98]"
        >
          Fund the audit of everything science has <em>published.</em>
        </h1>

        <p className="a-rise a-prose mt-6 max-w-[31em] !text-[17px] tablet:!text-[19px]">
          A machine audit of one field of astrophysics reported 872 errors in 433 papers. Only 47
          had ever been challenged in print.
          <Ref n={1} /> We are raising funds to audit more fields in the open, with experts checking
          what the machines flag.
        </p>

        <HeroCard rfp={rfp}>
          <div data-audit-hero-cta className="mt-5 flex w-full flex-wrap gap-2 tablet:gap-3">
            <AddToPoolButton size="lg" className={CARD_CTA} />
            <SubmitProposalButton size="lg" className={CARD_CTA} />
          </div>
        </HeroCard>
      </div>

      <p className="a-mono absolute bottom-5 right-6 z-10 hidden max-w-[350px] bg-[rgb(var(--a-paper-rgb)/0.88)] px-3 py-2 text-right !text-[10.5px] leading-[1.6] text-[var(--a-mute)] backdrop-blur-sm content-md:block">
        A field as stacks of paper, one sheet per paper. Red sheets hold an error; paler ones repeat
        it. An illustration, not data.
      </p>
    </section>
  );
}
