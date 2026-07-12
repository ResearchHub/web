import { GiveReadyGate } from './components/GiveReadyGate';
import { GiveTopBar } from './components/GiveTopBar';
import { GiveHero } from './components/GiveHero';
import { GiveAmplify } from './components/GiveAmplify';
import { GiveWays } from './components/GiveWays';
import { GiveDashboard } from './components/GiveDashboard';
import { GiveFAQ } from './components/GiveFAQ';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export default function GivePage() {
  return (
    <GiveReadyGate>
      <GiveTopBar />
      <GiveHero />
      <GiveAmplify />
      <GiveWays />
      <GiveDashboard />
      <GiveFAQ />
      <LandingPageFooter />
    </GiveReadyGate>
  );
}
