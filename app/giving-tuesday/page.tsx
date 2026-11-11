import { FeedService } from '@/services/feed.service';
import type { FeedGrantContent, FeedPostContent } from '@/types/feed';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayRfps } from '@/app/giving-tuesday/components/GivingTuesdayRfps';
import { GivingTuesdayClosing } from '@/app/giving-tuesday/components/GivingTuesdayClosing';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';
import { GivingTuesdayGlance } from '@/app/giving-tuesday/components/GivingTuesdayGlance';

const RFP_COUNT = 5;
const PROPOSAL_COUNT = 3;

/** Open RFPs taking gifts into their pool, largest first. */
async function fetchRfps() {
  const { entries } = await FeedService.getFeed({
    endpoint: 'grant_feed',
    contentType: 'GRANT',
    status: 'OPEN',
    ordering: 'amount_raised',
  });
  return entries
    .map((entry) => entry.content as FeedGrantContent)
    .filter((rfp) => rfp.grant.fundingPool?.status === 'OPEN')
    .slice(0, RFP_COUNT);
}

/**
 * Open proposals still short of their goal, closest to it first. Award proposals
 * have no goal, and a funded proposal can stay open until it completes.
 */
async function fetchProposals() {
  const { entries } = await FeedService.getFeed({
    endpoint: 'funding_feed',
    fundraiseStatus: 'OPEN',
  });
  return entries
    .map((entry) => entry.content as FeedPostContent)
    .filter((proposal) => proposal.fundraise && getFundedShare(proposal) < 1)
    .sort((a, b) => getFundedShare(b) - getFundedShare(a))
    .slice(0, PROPOSAL_COUNT);
}

function getFundedShare({ fundraise }: FeedPostContent) {
  return fundraise!.amountRaised.usd / fundraise!.goalAmount.usd;
}

export default async function GivingTuesdayPage() {
  const [rfps, proposals] = await Promise.all([fetchRfps(), fetchProposals()]);

  return (
    <>
      <GivingTuesdayHero rfps={rfps} proposals={proposals} />
      <GivingTuesdayRfps rfps={rfps} />
      <GivingTuesdayClosing />
      <GivingTuesdayFAQ />
      <GivingTuesdayGlance />
      <LandingPageFooter />
    </>
  );
}
