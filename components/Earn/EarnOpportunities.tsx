'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sprout, Star } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { EarnInfoModal } from './EarnInfoModal';

interface EarnOpportunitiesProps {
  /** Scrolls the page to the open-bounties feed below. */
  onBrowse: () => void;
}

interface OpportunityAction {
  label: string;
  onClick: () => void;
}

interface Opportunity {
  key: string;
  title: string;
  description: React.ReactNode;
  cta: OpportunityAction;
  ctaVariant?: 'default' | 'outlined';
  secondary?: OpportunityAction;
  icon: React.ReactNode;
  badgeClassName: string;
}

export function EarnOpportunities({ onBrowse }: EarnOpportunitiesProps) {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { stats } = useStakingYieldStats();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const apy = stats?.apy ?? null;

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 280);
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  const opportunities: Opportunity[] = [
    {
      key: 'endowment',
      title: 'Hold & earn yield',
      description: (
        <>
          Earn{' '}
          <span className="font-semibold text-emerald-700">
            {apy != null ? `up to ${apy.toFixed(1)}% APY` : 'daily yield'}
          </span>{' '}
          on your ResearchCoin
        </>
      ),
      cta: {
        label: 'Deposit & Earn',
        onClick: () => executeAuthenticatedAction(() => router.push('/researchcoin')),
      },
      ctaVariant: 'outlined',
      icon: <Sprout className="h-6 w-6 text-gray-900" />,
      badgeClassName: 'bg-gray-100',
    },
    {
      key: 'review',
      title: 'Peer review papers',
      description: (
        <>
          Earn <span className="font-semibold text-emerald-700">~$150</span> in RSC per approved
          review
        </>
      ),
      cta: { label: 'Browse', onClick: onBrowse },
      ctaVariant: 'outlined',
      secondary: { label: 'Learn more', onClick: () => setIsInfoOpen(true) },
      icon: <Star className="h-6 w-6 text-gray-900" />,
      badgeClassName: 'bg-gray-100',
    },
    {
      key: 'fund',
      title: 'Fund science',
      description: <>Put your funding credits to work backing research</>,
      cta: {
        label: 'Fund',
        onClick: () => executeAuthenticatedAction(() => router.push('/fund')),
      },
      ctaVariant: 'outlined',
      icon: <Icon name="fund" size={24} color="#111827" />,
      badgeClassName: 'bg-gray-100',
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-gray-900">Earning Opportunities</h2>
        <div className="flex items-center gap-2">
          <CarouselButton label="Previous opportunities" onClick={() => scrollByCard(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </CarouselButton>
          <CarouselButton label="More opportunities" onClick={() => scrollByCard(1)}>
            <ChevronRight className="h-4 w-4" />
          </CarouselButton>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {opportunities.map((opp) => (
          <div
            key={opp.key}
            className="snap-start shrink-0 w-[300px] sm:w-[360px] bg-gray-50 rounded-2xl p-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex flex-col">
              <h3 className="text-[15px] font-semibold text-gray-800">{opp.title}</h3>
              <p className="mt-1 text-sm text-gray-600 leading-snug">{opp.description}</p>
              <div className="mt-4 flex items-center gap-1">
                <Button variant={opp.ctaVariant ?? 'default'} size="sm" onClick={opp.cta.onClick}>
                  {opp.cta.label}
                </Button>
                {opp.secondary && (
                  <Button variant="ghost" size="sm" onClick={opp.secondary.onClick}>
                    {opp.secondary.label}
                  </Button>
                )}
              </div>
            </div>
            <span
              className={`flex items-center justify-center h-16 w-16 rounded-full shrink-0 ${opp.badgeClassName}`}
            >
              {opp.icon}
            </span>
          </div>
        ))}
      </div>

      <EarnInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );
}
