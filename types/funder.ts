import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export interface CurrencyAmount {
  rsc: number;
  usd: number;
}

export interface SupportedResearcher {
  id: number;
  authorProfile: AuthorProfile;
  fundedAmount: CurrencyAmount;
}

export interface SupportedProposal {
  id: number;
  title: string;
  slug: string;
  createdBy: {
    id: number;
    authorProfile: AuthorProfile;
  };
  fundedAmount: CurrencyAmount;
}

export interface SupportedInstitution {
  id: number;
  name: string;
  city?: string;
  countryCode?: string;
}

export interface FunderOverview {
  matchedFunds: CurrencyAmount;
  distributedFunds: CurrencyAmount;
  supportedResearchers: SupportedResearcher[];
  supportedProposals: SupportedProposal[];
  // Display headline ($1.24M) — alias of distributedFunds for the hero copy.
  totalGiven: CurrencyAmount;
  // Alias of matchedFunds for the hero copy.
  communityMatch: CurrencyAmount;
  // Combined: your funding + community match.
  totalDeployed: CurrencyAmount;
  // Formatted ratio string, e.g. "1 : 0.49".
  matchRatio: string;
  supportedScientistsCount: number;
  supportedInstitutions: SupportedInstitution[];
  supportedInstitutionCount: number;
}

/**
 * Format a "1 : X" match ratio. Snap to a whole number when within 0.1
 * (so 1.95 → "1 : 2"); otherwise round to 2 significant digits (1.755 → "1 : 1.8").
 * Uses RSC if available, else USD.
 */
function formatMatchRatio(given: CurrencyAmount, match: CurrencyAmount): string {
  const denom = given.rsc > 0 ? given.rsc : given.usd;
  const numer = given.rsc > 0 ? match.rsc : match.usd;
  if (denom <= 0) return '—';
  const ratio = numer / denom;
  const nearestWhole = Math.round(ratio);
  if (Math.abs(ratio - nearestWhole) <= 0.1) {
    return `1 : ${nearestWhole}`;
  }
  return `1 : ${parseFloat(ratio.toPrecision(2))}`;
}

export function transformFunderOverview(raw: any): FunderOverview {
  const proposals = extractProposals(raw.supported_proposals);
  const researchers = extractResearchers(proposals);

  const distributedFunds: CurrencyAmount = {
    rsc: raw.distributed_funds?.rsc ?? 0,
    usd: usdFromAmount(raw.distributed_funds),
  };
  const matchedFunds: CurrencyAmount = {
    rsc: raw.matched_funds?.rsc ?? 0,
    usd: usdFromAmount(raw.matched_funds),
  };

  const totalGiven = distributedFunds;
  const communityMatch = matchedFunds;
  const totalDeployed: CurrencyAmount = {
    rsc: totalGiven.rsc + communityMatch.rsc,
    usd: totalGiven.usd + communityMatch.usd,
  };

  const matchRatio = formatMatchRatio(totalGiven, communityMatch);
  const supportedInstitutions = extractInstitutions(raw);

  return {
    matchedFunds,
    distributedFunds,
    supportedResearchers: researchers,
    supportedProposals: proposals,
    totalGiven,
    communityMatch,
    totalDeployed,
    matchRatio,
    supportedScientistsCount: researchers.length,
    supportedInstitutions,
    supportedInstitutionCount: supportedInstitutions.length,
  };
}

function extractProposals(rawProposals: any[]): SupportedProposal[] {
  return (rawProposals ?? [])
    .filter((p: any) => p.created_by)
    .map((p: any) => ({
      id: p.id,
      title: p.unified_document?.title ?? '',
      slug: p.unified_document?.slug ?? '',
      createdBy: {
        id: p.created_by.id,
        authorProfile: transformAuthorProfile(p.created_by.author_profile),
      },
      fundedAmount: {
        rsc: p.funded_amount?.rsc ?? 0,
        usd: usdFromAmount(p.funded_amount),
      },
    }));
}

function extractResearchers(proposals: SupportedProposal[]): SupportedResearcher[] {
  const map = new Map<number, SupportedResearcher>();

  for (const proposal of proposals) {
    const { id, authorProfile } = proposal.createdBy;
    const existing = map.get(id);
    if (existing) {
      existing.fundedAmount.rsc += proposal.fundedAmount.rsc;
      existing.fundedAmount.usd += proposal.fundedAmount.usd;
    } else {
      map.set(id, {
        id,
        authorProfile,
        fundedAmount: { ...proposal.fundedAmount },
      });
    }
  }

  return Array.from(map.values());
}

/**
 * USD display value for an amount object. Sums any direct USD contributions
 * with `rsc_usd_snapshot` (the USD-equivalent of RSC frozen at contribution
 * time), so the display reflects the value at the moment funds were committed
 * rather than the live RSC price.
 */
function usdFromAmount(amount: any): number {
  if (!amount) return 0;
  return (amount.rsc_usd_snapshot ?? 0) + (amount.usd ?? 0);
}

function extractInstitutions(raw: any): SupportedInstitution[] {
  // Backend may use either `supported_institutions` (rich OpenAlex data)
  // or `supported_nonprofits` (Endaoment data). Map either to the same shape.
  const rows = Array.isArray(raw.supported_institutions)
    ? raw.supported_institutions
    : Array.isArray(raw.supported_nonprofits)
      ? raw.supported_nonprofits
      : [];
  return rows.map((n: any) => ({
    id: n.id,
    name: n.display_name ?? n.name ?? '',
    city: n.city ?? undefined,
    countryCode: n.country_code ?? undefined,
  }));
}
