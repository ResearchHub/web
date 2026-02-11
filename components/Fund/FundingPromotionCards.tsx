'use client';

import React from 'react';
import Link from 'next/link';
import { Microscope, ArrowRight, X, Users } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';

interface PromotionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  ctaColor: string;
  onClose?: () => void;
}

const PromotionCard = ({
  icon,
  title,
  description,
  ctaText,
  ctaHref,
  ctaColor,
  onClose,
}: PromotionCardProps) => {
  return (
    <div className="relative flex-shrink-0 w-[340px] bg-gray-100 rounded-2xl p-5 pr-10">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-gray-600 hover:text-gray-800" />
      </button>

      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          <Link
            href={ctaHref}
            className={`inline-flex items-center gap-1 text-xs font-medium ${ctaColor} transition-colors mt-2`}
          >
            {ctaText}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

interface FundingPromotionCardsProps {
  onCloseFunder?: () => void;
  onCloseResearcher?: () => void;
  onCloseReviewer?: () => void;
}

export const FundingPromotionCards = ({
  onCloseFunder,
  onCloseResearcher,
  onCloseReviewer,
}: FundingPromotionCardsProps) => {
  return (
    <div className="relative">
      {/* Right fade gradient to indicate more content */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 min-w-max pr-8">
          {/* Funder Card */}
          <PromotionCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Icon name="fund" size={20} color="#ffffff" />
              </div>
            }
            title="Fund Breakthrough Research"
            description="Connect with top researchers"
            ctaText="Post Opportunity"
            ctaHref="/notebook?newGrant=true"
            ctaColor="text-blue-600 hover:text-blue-700"
            onClose={onCloseFunder}
          />

          {/* Researcher Card */}
          <PromotionCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Microscope className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            }
            title="Get Funded"
            description="Apply for grants and opportunities"
            ctaText="View Grants"
            ctaHref="/fund/opportunities"
            ctaColor="text-orange-600 hover:text-orange-700"
            onClose={onCloseResearcher}
          />

          {/* Peer Reviewer Card */}
          <PromotionCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            }
            title="Become a Peer Reviewer"
            description="View peer review opportunities"
            ctaText="Start Reviewing"
            ctaHref="/earn"
            ctaColor="text-amber-600 hover:text-amber-700"
            onClose={onCloseReviewer}
          />
        </div>
      </div>
    </div>
  );
};
