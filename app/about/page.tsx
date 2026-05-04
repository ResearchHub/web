'use client';

import { SubtabsNav, type SubtabsSection } from '@/components/about/SubtabsNav';
import { Hero } from '@/components/about/Hero';
import { FundedAt } from '@/components/about/FundedAt';
import { Problem } from '@/components/about/Problem';
import { Solution } from '@/components/about/Solution';
import { FundingMarketplace } from '@/components/about/FundingMarketplace';
import { ResearchCoin } from '@/components/about/ResearchCoin';
import { Endaoment } from '@/components/about/Endaoment';
import { TeamSection } from '@/components/about/TeamSection';
import { CTASection } from '@/components/about/CTASection';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const sections: ReadonlyArray<SubtabsSection> = [
  { id: 'about', label: 'About' },
  { id: 'team', label: 'Team' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SubtabsNav sections={sections} />

      <section id="about">
        <Hero />
        <Problem />
        <Solution />
        <FundingMarketplace />
        <FundedAt />
        <ResearchCoin />
        <Endaoment />
      </section>

      <section id="team">
        <TeamSection />
      </section>

      <CTASection />
      <LandingPageFooter />
    </div>
  );
};

export default AboutPage;
