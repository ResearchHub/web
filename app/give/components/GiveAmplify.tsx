'use client';

import { ContributionAmplifySection } from '@/components/landing/ContributionAmplifySection';
import { CosmosPixelFade } from './CosmosPixelFade';

/**
 * The shared contribution-amplification section, dressed to dissolve into the
 * cosmos hero above it on /give.
 */
export function GiveAmplify() {
  return <ContributionAmplifySection overlapHero backdrop={<CosmosPixelFade height={120} />} />;
}
