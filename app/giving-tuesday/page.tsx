import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayMatch } from '@/app/giving-tuesday/components/GivingTuesdayMatch';
import { GivingTuesdayTopics } from '@/app/giving-tuesday/components/GivingTuesdayTopics';
import { GivingTuesdaySteps } from '@/app/giving-tuesday/components/GivingTuesdaySteps';
import { GivingTuesdayWhyGive } from '@/app/giving-tuesday/components/GivingTuesdayWhyGive';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';

export default function GivingTuesdayPage() {
  return (
    <>
      <GivingTuesdayHero />
      <GivingTuesdayMatch />
      <GivingTuesdayTopics />
      <GivingTuesdaySteps />
      <GivingTuesdayWhyGive />
      <GivingTuesdayFAQ />
      <LandingPageFooter />
    </>
  );
}
