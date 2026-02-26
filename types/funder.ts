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

  return {
    matchedFunds: {
      rsc: raw.matched_funds?.rsc ?? 0,
      usd: raw.matched_funds?.usd ?? 0,
    },
    distributedFunds: {
      rsc: raw.distributed_funds?.rsc ?? 0,
      usd: raw.distributed_funds?.usd ?? 0,
    },
    supportedResearchers: researchers,
  };
}
