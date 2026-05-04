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
  // Display headline ($1.24M) — alias of distributedFunds for the hero copy.
  totalGiven: CurrencyAmount;
  // Alias of matchedFunds for the hero copy.
  communityMatch: CurrencyAmount;
  // Combined: your funding + community match.
  totalDeployed: CurrencyAmount;
  // Formatted ratio string, e.g. "1 : 0.49".
  matchRatio: string;
  supportedScientistsCount: number;
  // TODO: replace with API field `supported_institution_count` once backend ships it.
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

  const totalGiven = distributedFunds;
  const communityMatch = matchedFunds;
  const totalDeployed: CurrencyAmount = {
    rsc: totalGiven.rsc + communityMatch.rsc,
    usd: totalGiven.usd + communityMatch.usd,
  };

  const matchRatio =
    totalGiven.usd > 0 ? `1 : ${(communityMatch.usd / totalGiven.usd).toFixed(2)}` : '—';

  return {
    matchedFunds,
    distributedFunds,
    supportedResearchers: researchers,
    totalGiven,
    communityMatch,
    totalDeployed,
    matchRatio,
    supportedScientistsCount: researchers.length,
    // TODO: replace with API field `supported_institution_count` once backend ships it.
    supportedInstitutionCount: raw.supported_institution_count ?? 0,
  };
}
