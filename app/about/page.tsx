import { SubtabsNav, type SubtabsSection } from '@/components/about/SubtabsNav';
import { Hero } from '@/components/about/Hero';
import { FundedAt } from '@/components/about/FundedAt';
import { Problem } from '@/components/about/Problem';
import { Solution } from '@/components/about/Solution';
import { FundingMarketplace } from '@/components/about/FundingMarketplace';
import { ResearchCoin } from '@/components/about/ResearchCoin';
import { PartnershipSection } from '@/components/about/PartnershipSection';
import { TeamSection } from '@/components/about/TeamSection';
import { CTASection } from '@/components/about/CTASection';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const sections: ReadonlyArray<SubtabsSection> = [
  { id: 'about', label: 'About' },
  { id: 'team', label: 'Team' },
];

const AboutPage = () => (
  <>
    <SubtabsNav sections={sections} />

    <section id="about">
      <Hero />
      <Problem />
      <Solution />
      <FundingMarketplace />
      <FundedAt />
      <ResearchCoin />
      <PartnershipSection />
    </section>

    <section id="team">
      <TeamSection />
    </section>

    <CTASection />
    <LandingPageFooter />
  </>
);

export default AboutPage;
