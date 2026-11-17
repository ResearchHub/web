import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { HeroCopy } from '../components/Hero';
import { BOXES, HEADLINES } from '../components/HeroVariants';

export const metadata: Metadata = {
  title: 'Consciousness hero mocks',
  robots: { index: false, follow: false },
};

function OpenLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-[13.5px] font-medium text-[var(--o-gold)] underline-offset-4 hover:underline"
    >
      Open in the page <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
    </Link>
  );
}

/** The hero's left column over the hero still, as on the page, at a fixed frame. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate mt-5 overflow-hidden rounded-[24px] bg-[var(--o-ink)] ring-1 ring-[color:var(--o-line-2)]">
      <Image
        src="/consciousness/sets/poster/hero-p.webp"
        alt=""
        fill
        sizes="(min-width: 768px) 60vw, 100vw"
        className="hidden object-cover object-right opacity-90 tablet:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,var(--o-ink)_0%,rgb(var(--o-ink-rgb)/0.85)_30%,rgb(var(--o-ink-rgb)/0)_54%)] tablet:block"
      />
      <div className="relative z-10 px-5 py-10 tablet:w-[min(760px,62%)] tablet:px-10 tablet:py-14">
        {children}
      </div>
    </div>
  );
}

/**
 * Mock treatments of the hero for Kobe to compare (2026-11-17): six phase
 * boxes, each in the hero's own column over the hero still, then eight
 * headlines. Each links to the real page with `?box=` or `?h=` set.
 */
export default function HeroMocks() {
  return (
    <div className="pb-28">
      <header className="px-5 pb-6 pt-14 tablet:px-10 content-lg:px-16">
        <p className="text-[13px] text-[var(--o-mute)]">
          <Link href="/consciousness" className="underline-offset-4 hover:underline">
            Consciousness landing page
          </Link>{' '}
          · preview
        </p>
        <h1 className="o-serif mt-3 text-[clamp(32px,4vw,52px)] leading-[1.05]">Hero mocks</h1>
        <p className="o-prose mt-4 max-w-[40em]">
          Six treatments of the phase box and eight headlines. Each opens in the real page, with the
          figure and the dock, from its link.
        </p>
        <nav className="mt-5 flex gap-4 text-[14px]">
          <a href="#boxes" className="underline underline-offset-4">
            Phase box
          </a>
          <a href="#headlines" className="underline underline-offset-4">
            Headline
          </a>
        </nav>
      </header>

      <section id="boxes" className="o-rule mt-6 border-t px-5 pt-12 tablet:px-10 content-lg:px-16">
        <h2 className="o-serif text-[28px]">Phase box</h2>
        <div className="mt-6 space-y-16">
          {BOXES.map((b) => (
            <article key={b.id} aria-labelledby={`box-${b.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <h3 id={`box-${b.id}`} className="o-serif text-[22px]">
                    {b.id} · {b.name}
                  </h3>
                  <p className="mt-1 max-w-[46em] text-[14.5px] text-[var(--o-soft)]">{b.note}</p>
                </div>
                <OpenLink href={`/consciousness?box=${b.id}`} />
              </div>
              <Frame>
                <HeroCopy box={b.id} />
              </Frame>
            </article>
          ))}
        </div>
      </section>

      <section
        id="headlines"
        className="o-rule mt-20 border-t px-5 pt-12 tablet:px-10 content-lg:px-16"
      >
        <h2 className="o-serif text-[28px]">Headline</h2>
        <p className="mt-2 max-w-[44em] text-[14.5px] text-[var(--o-soft)]">
          Shown at the hero&rsquo;s size, with the line that follows it on the page.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-14 content-md:grid-cols-2">
          {HEADLINES.map((h) => (
            <article key={h.id} aria-labelledby={`h-${h.id}`}>
              <div className="flex items-baseline justify-between gap-4 text-[13.5px] text-[var(--o-mute)]">
                <span id={`h-${h.id}`}>
                  {h.id} · {h.note}
                </span>
                <OpenLink href={`/consciousness?h=${h.id}`} />
              </div>
              <p className="o-serif o-rule mt-3 max-w-[11em] text-balance border-t pt-5 text-[clamp(34px,4.4vw,64px)] leading-[1.02]">
                {h.lead} <em className="block">{h.emph}</em>
              </p>
              <p className="o-prose mt-4 max-w-[33em] text-[15px]">
                Could an AI be conscious? Does experience need quantum physics? We are raising funds
                to test the leading theories of how consciousness arises.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
