'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { cn } from '@/utils/styles';
import { useAuthModalContext } from '@/contexts/AuthModalContext';

type CtaItem =
  | { kind: 'link'; href: string; label: string; primary?: boolean; external?: boolean }
  | { kind: 'action'; label: string; onAction: () => void; primary?: boolean };

const itemClasses = (primary?: boolean) =>
  cn(
    'group flex items-center justify-between gap-3 w-full px-4 sm:px-5 py-4 rounded-xl font-medium transition-colors',
    primary
      ? 'bg-white text-primary-700 hover:bg-primary-50'
      : 'border border-white/40 bg-white/10 text-white hover:bg-white/20'
  );

const ItemContent = ({ label }: { label: string }) => (
  <>
    <span className="truncate">{label}</span>
    <ArrowRight
      className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
      aria-hidden
    />
  </>
);

export const CTASection = () => {
  const { showAuthModal } = useAuthModalContext();
  const router = useRouter();

  const items: CtaItem[] = [
    {
      kind: 'link',
      href: 'mailto:hello@researchhub.com',
      label: 'hello@researchhub.com',
      primary: true,
      external: false,
    },
    {
      kind: 'action',
      label: 'Join ResearchHub',
      onAction: () => showAuthModal(() => router.push('/popular')),
    },
    { kind: 'link', href: '/fund', label: 'Fund science', external: true },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-28 bg-white border-t border-gray-100">
      <AboutContainer>
        <div className="rounded-2xl sm:rounded-3xl bg-primary-500 text-white p-5 sm:p-10 md:p-16 lg:p-20 relative overflow-hidden">
          <div className="relative grid gap-6 md:grid-cols-12 md:gap-10 md:items-end">
            <div className="md:col-span-8">
              <Eyebrow tone="onDark" className="mb-4 sm:mb-5">
                Get involved
              </Eyebrow>
              <h2
                className="font-medium tracking-[-0.022em] leading-[1.05] md:leading-[1.02] text-[clamp(28px,7vw,72px)]"
                style={{ textWrap: 'balance' }}
              >
                Help us build the <br className="hidden md:block" />
                <span className="italic font-light">hub for open science.</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-[17px] md:text-[18px] leading-[1.6] text-white/95 max-w-xl">
                Upload a paper, fund a proposal, or reach out. We&apos;re a small team working to
                redesign science from the ground up.
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col gap-3">
              {items.map((item) =>
                item.kind === 'link' ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className={itemClasses(item.primary)}
                  >
                    <ItemContent label={item.label} />
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onAction}
                    className={itemClasses(item.primary)}
                  >
                    <ItemContent label={item.label} />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </AboutContainer>
    </section>
  );
};
