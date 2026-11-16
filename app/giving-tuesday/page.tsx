import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayMatch } from '@/app/giving-tuesday/components/GivingTuesdayMatch';
import { GivingTuesdayTopics } from '@/app/giving-tuesday/components/GivingTuesdayTopics';
import { GivingTuesdayWhy } from '@/app/giving-tuesday/components/GivingTuesdayWhy';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';

export default function GivingTuesdayPage() {
  return (
    <>
      <GivingTuesdayHero />
      <GivingTuesdayMatch />
      <GivingTuesdayTopics />
      <GivingTuesdayWhy />
      <GivingTuesdayFAQ />
      <LandingPageFooter />
    </>
  );
}
