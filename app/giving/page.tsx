import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving/components/GivingTuesdayHero';
import { GivingTuesdayMatch } from '@/app/giving/components/GivingTuesdayMatch';
import { GivingTuesdayTopics } from '@/app/giving/components/GivingTuesdayTopics';
import { GivingTuesdayWhy } from '@/app/giving/components/GivingTuesdayWhy';
import { GivingTuesdayFAQ } from '@/app/giving/components/GivingTuesdayFAQ';

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
