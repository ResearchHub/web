import { GIVING_TUESDAY_FUND_POST_ID } from '@/config/constants';
import { FeedService } from '@/services/feed.service';
import { PostService } from '@/services/post.service';
import type { FeedGrantContent, FeedPostContent } from '@/types/feed';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { GivingTuesdayHero } from '@/app/giving-tuesday/components/GivingTuesdayHero';
import { GivingTuesdayRfps } from '@/app/giving-tuesday/components/GivingTuesdayRfps';
import { GivingTuesdayClosing } from '@/app/giving-tuesday/components/GivingTuesdayClosing';
import { GivingTuesdayFAQ } from '@/app/giving-tuesday/components/GivingTuesdayFAQ';
import { GivingTuesdayGlance } from '@/app/giving-tuesday/components/GivingTuesdayGlance';

const RFP_COUNT = 5;
const PROPOSAL_COUNT = 3;

/** The ResearchHub-run RFP that general gifts go into, or null when it isn't set up or can't load. */
async function fetchScienceFund() {
  if (!GIVING_TUESDAY_FUND_POST_ID) return null;
  try {
    const work = await PostService.get(GIVING_TUESDAY_FUND_POST_ID);
    return work.note?.post?.grant ?? null;
  } catch (error) {
    console.error('Failed to fetch the Giving Tuesday science fund:', error);
    return null;
  }
}

/** Open RFPs, largest first. */
async function fetchRfps() {
  const { entries } = await FeedService.getFeed({
    endpoint: 'grant_feed',
    contentType: 'GRANT',
    status: 'OPEN',
    ordering: 'amount_raised',
  });
  return entries.map((entry) => entry.content as FeedGrantContent);
}

/** Open proposals, closest to their goal first. */
async function fetchProposals() {
  const { entries } = await FeedService.getFeed({
    endpoint: 'funding_feed',
    fundraiseStatus: 'OPEN',
  });
  return entries
    .map((entry) => entry.content as FeedPostContent)
    .filter((proposal) => proposal.fundraise)
    .sort((a, b) => getFundedShare(b) - getFundedShare(a))
    .slice(0, PROPOSAL_COUNT);
}

function getFundedShare({ fundraise }: FeedPostContent) {
  return fundraise!.amountRaised.usd / fundraise!.goalAmount.usd;
}

export default async function GivingTuesdayPage() {
  const [scienceFund, allRfps, proposals] = await Promise.all([
    fetchScienceFund(),
    fetchRfps(),
    fetchProposals(),
  ]);
  const scienceFundPool =
    scienceFund?.fundingPool?.status === 'OPEN' ? scienceFund.fundingPool : null;
  const rfps = allRfps
    .filter((rfp) => rfp.grant.fundingPool?.status === 'OPEN' && rfp.grant.id !== scienceFund?.id)
    .slice(0, RFP_COUNT);

  return (
    <>
      <GivingTuesdayHero scienceFundPool={scienceFundPool} rfps={rfps} proposals={proposals} />
      <GivingTuesdayRfps rfps={rfps} />
      <GivingTuesdayClosing />
      <GivingTuesdayFAQ />
      <GivingTuesdayGlance />
      <LandingPageFooter />
    </>
  );
}
