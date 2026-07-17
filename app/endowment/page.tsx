import { EndowmentReadyGate } from './components/EndowmentReadyGate';
import { EndowmentTopBar } from './components/EndowmentTopBar';
import { EndowmentHero } from './components/EndowmentHero';
import { EndowmentStatsBand } from './components/EndowmentStatsBand';
import { EndowmentHowItWorks } from './components/EndowmentHowItWorks';
import { EndowmentMultiplierSection } from './components/EndowmentMultiplierSection';
import { EndowmentFAQ } from './components/EndowmentFAQ';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export default function EndowmentPage() {
  return (
    <EndowmentReadyGate>
      <EndowmentTopBar />
      <EndowmentHero />
      <EndowmentStatsBand />
      <EndowmentHowItWorks />
      <EndowmentMultiplierSection />
      <EndowmentFAQ />
      <LandingPageFooter />
    </EndowmentReadyGate>
  );
}
