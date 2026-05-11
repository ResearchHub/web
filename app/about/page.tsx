import { SubtabsNav, type SubtabsSection } from './components/SubtabsNav';
import { Hero } from './components/Hero';
import { FundedAt } from './components/FundedAt';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { FundingMarketplace } from './components/FundingMarketplace';
import { ResearchCoin } from './components/ResearchCoin';
import { PartnershipSection } from './components/PartnershipSection';
import { TeamSection } from './components/TeamSection';
import { CTASection } from './components/CTASection';
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
