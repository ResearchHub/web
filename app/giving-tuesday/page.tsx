import { ShaderBackdrop } from '@/components/Auth/takeover/ShaderBackdrop';
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
      {/* The clip keeps the fixed backdrop inside this wrapper, so it stops at the footer. */}
      <div className="relative isolate bg-[#11224d] [clip-path:inset(0)]">
        <ShaderBackdrop backdrop="bokeh" layout="panel" className="fixed inset-0 -z-10" />
        <GivingTuesdayHero />
        <GivingTuesdayMatch />
        <GivingTuesdayTopics />
        <GivingTuesdaySteps />
        <GivingTuesdayWhyGive />
        <GivingTuesdayFAQ />
      </div>
      <LandingPageFooter />
    </>
  );
}
