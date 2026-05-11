import { SubtabsNav, type SubtabsSection } from './SubtabsNav';
import { Hero } from './Hero';
import { FundedAt } from './FundedAt';
import { Problem } from './Problem';
import { Solution } from './Solution';
import { FundingMarketplace } from './FundingMarketplace';
import { ResearchCoin } from './ResearchCoin';
import { PartnershipSection } from './PartnershipSection';
import { TeamSection } from './TeamSection';
import { CTASection } from './CTASection';
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
