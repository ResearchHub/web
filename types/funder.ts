import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export interface CurrencyAmount {
  rsc: number;
  usd: number;
}

export interface SupportedResearcher {
  id: number;
  authorProfile: AuthorProfile;
}

export interface FunderOverview {
  matchedFunds: CurrencyAmount;
  distributedFunds: CurrencyAmount;
  supportedResearchers: SupportedResearcher[];
  // MOCK: replace with API field `total_given` — display headline ($1.24M)
  totalGiven: CurrencyAmount;
  // MOCK: replace with API field `community_match`
  communityMatch: CurrencyAmount;
  // MOCK: replace with API field `total_deployed` (your + match combined)
  totalDeployed: CurrencyAmount;
  // MOCK: replace with API field `match_ratio` — string like "1 : 0.49"
  matchRatio: string;
  // MOCK: replace with API field `supported_scientists_count`
  supportedScientistsCount: number;
  // MOCK: replace with API field `supported_institution_count`
  supportedInstitutionCount: number;
}

export function transformFunderOverview(raw: any): FunderOverview {
  const seen = new Set<number>();
  const researchers: SupportedResearcher[] = [];

  for (const proposal of raw.supported_proposals ?? []) {
    const creator = proposal.created_by;
    if (!creator || seen.has(creator.id)) continue;
    seen.add(creator.id);
    researchers.push({
      id: creator.id,
      authorProfile: transformAuthorProfile(creator.author_profile),
    });
  }

  const distributedFunds: CurrencyAmount = {
    rsc: raw.distributed_funds?.rsc ?? 0,
    usd: raw.distributed_funds?.usd ?? 0,
  };
  const matchedFunds: CurrencyAmount = {
    rsc: raw.matched_funds?.rsc ?? 0,
    usd: raw.matched_funds?.usd ?? 0,
  };

  // MOCK: derive new hero fields from existing API fields where possible,
  // fall back to mocked values that match the design spec ($1.24M / $612K / etc.).
  const totalGiven: CurrencyAmount = raw.total_given ?? {
    rsc: distributedFunds.rsc || 1_240_000,
    usd: distributedFunds.usd || 1_240_000,
  };
  const communityMatch: CurrencyAmount = raw.community_match ?? {
    rsc: matchedFunds.rsc || 612_000,
    usd: matchedFunds.usd || 612_000,
  };
  const totalDeployed: CurrencyAmount = raw.total_deployed ?? {
    rsc: totalGiven.rsc + communityMatch.rsc,
    usd: totalGiven.usd + communityMatch.usd,
  };

  return {
    matchedFunds,
    distributedFunds,
    supportedResearchers: researchers,
    totalGiven,
    communityMatch,
    totalDeployed,
    matchRatio: raw.match_ratio ?? '1 : 0.49',
    supportedScientistsCount: raw.supported_scientists_count ?? (researchers.length || 47),
    supportedInstitutionCount: raw.supported_institution_count ?? 12,
  };
}
