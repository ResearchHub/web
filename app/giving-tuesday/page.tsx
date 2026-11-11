import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { fetchGiftProposals } from '@/app/giving-tuesday/lib/giftProposals';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayCauses } from '@/app/giving-tuesday/components/GivingTuesdayCauses';
import { GivingTuesdayWhyGive } from '@/app/giving-tuesday/components/GivingTuesdayWhyGive';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';
import { GivingTuesdayGlance } from '@/app/giving-tuesday/components/GivingTuesdayGlance';

export default async function GivingTuesdayPage() {
  const proposals = await fetchGiftProposals();

  return (
    <>
      <GivingTuesdayHero proposals={proposals} />
      <GivingTuesdayCauses proposals={proposals} />
      <GivingTuesdayWhyGive />
      <GivingTuesdayFAQ />
      <GivingTuesdayGlance />
      <LandingPageFooter />
    </>
  );
}
