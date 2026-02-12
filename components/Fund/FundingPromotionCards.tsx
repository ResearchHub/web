'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Microscope, ArrowRight, Star } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { Carousel, CarouselCard } from '@/components/ui/Carousel';
import { FundingLearnMoreModal } from './FundingLearnMoreModal';
import { useDismissableFeatures } from '@/hooks/useDismissableFeature';

const CARD_FEATURES = [
  'funding_promo_funder',
  'funding_promo_researcher',
  'funding_promo_reviewer',
] as const;

export const FundingPromotionCards = () => {
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const { features, dismissFeature } = useDismissableFeatures([...CARD_FEATURES]);

  const allCards: (CarouselCard & { featureKey: string })[] = [
    {
      featureKey: CARD_FEATURES[0],
      onClose: () => dismissFeature(CARD_FEATURES[0]),
      content: (
        <div className="flex items-center gap-3 pr-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Icon name="fund" size={26} color="#6366f1" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900">I&apos;m a Funder</h3>
            <p className="text-sm text-gray-600 mt-0.5">Fund peer-reviewed proposals</p>
            <button
              onClick={() => setIsLearnMoreOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1"
            >
              Learn More
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      featureKey: CARD_FEATURES[1],
      onClose: () => dismissFeature(CARD_FEATURES[1]),
      content: (
        <div className="flex items-center gap-3 pr-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Microscope className="w-[26px] h-[26px] text-indigo-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900">I&apos;m a Researcher</h3>
            <p className="text-sm text-gray-600 mt-0.5">Apply to open opportunities</p>
            <Link
              href="/fund/opportunities"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1"
            >
              View Opportunities
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      featureKey: CARD_FEATURES[2],
      onClose: () => dismissFeature(CARD_FEATURES[2]),
      content: (
        <div className="flex items-center gap-3 pr-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-[26px] h-[26px] text-indigo-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900">Paid Peer Review</h3>
            <p className="text-sm text-gray-600 mt-0.5">Earn $150 for peer reviews</p>
            <Link
              href="/earn"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1"
            >
              Browse Bounties
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
  ];

  // Filter out dismissed cards
  const visibleCards = allCards.filter((card) => !features[card.featureKey]?.isDismissed);

  // Hide entire section when all cards are dismissed
  if (visibleCards.length === 0) return null;

  return (
    <>
      <Carousel
        cards={visibleCards}
        cardWidth="w-[310px]"
        fillContainer={visibleCards.length <= 2}
      />
      <FundingLearnMoreModal isOpen={isLearnMoreOpen} onClose={() => setIsLearnMoreOpen(false)} />
    </>
  );
};
