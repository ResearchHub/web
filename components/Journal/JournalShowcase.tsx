'use client';

import { FC } from 'react';
import {
  HeroSection,
  ForYouCarousel,
  VerificationBanner,
  PeerReviewSection,
  RecentSubmissionsCarousel,
  PromotionalBanner,
  TrendingPapersCarousel,
  SubmitCTA,
  FundingCarousel,
} from './components';

export const JournalShowcase: FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <HeroSection />

      {/* For You Carousel */}
      <ForYouCarousel />

      {/* Verification Banner */}
      <VerificationBanner />

      {/* Trending Papers Carousel */}
      <TrendingPapersCarousel />

      {/* Peer Review Section */}
      <PeerReviewSection />

      {/* Recent Submissions Carousel */}
      <RecentSubmissionsCarousel />

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Funding Carousel */}
      <FundingCarousel />

      {/* Submit CTA Banner */}
      {/* <SubmitCTA /> */}
    </div>
  );
};
