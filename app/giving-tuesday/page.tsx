import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayTopics } from '@/app/giving-tuesday/components/GivingTuesdayTopics';
import { GivingTuesdayWhyGive } from '@/app/giving-tuesday/components/GivingTuesdayWhyGive';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';
import { GivingTuesdayGlance } from '@/app/giving-tuesday/components/GivingTuesdayGlance';

export default function GivingTuesdayPage() {
  return (
    <>
      <GivingTuesdayHero />
      <GivingTuesdayTopics />
      <GivingTuesdayWhyGive />
      <GivingTuesdayFAQ />
      <GivingTuesdayGlance />
      <LandingPageFooter />
    </>
  );
}
