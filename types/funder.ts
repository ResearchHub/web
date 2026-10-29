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
  /** The proposal's cover, when it has one. */
  image: string | null;
  createdBy: {
    id: number;
    authorProfile: AuthorProfile;
  };
  fundedAmount: CurrencyAmount;
}

export interface SupportedGrant extends SupportedProposal {
  /** Offering org, when the RFP has one. */
  organization?: string;
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
  supportedGrants: SupportedGrant[];
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
  const grants = extractGrants(raw.supported_grants);
  const researchers = extractResearchers([...proposals, ...grants]);

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
    supportedGrants: grants,
    totalGiven,
    communityMatch,
    totalDeployed,
    matchRatio,
    supportedScientistsCount: researchers.length,
    supportedInstitutions,
    supportedInstitutionCount: supportedInstitutions.length,
  };
}

function extractBase(item: any): SupportedProposal {
  return {
    id: item.id,
    title: item.unified_document?.title ?? '',
    slug: item.unified_document?.slug ?? '',
    image: item.image_url || null,
    createdBy: {
      id: item.created_by.id,
      authorProfile: transformAuthorProfile(item.created_by.author_profile),
    },
    fundedAmount: {
      rsc: item.funded_amount?.rsc ?? 0,
      usd: usdFromAmount(item.funded_amount),
    },
  };
}

function extractProposals(rawItems: any[]): SupportedProposal[] {
  return (rawItems ?? []).filter((item: any) => item.created_by).map(extractBase);
}

function extractGrants(rawItems: any[]): SupportedGrant[] {
  return (rawItems ?? [])
    .filter((item: any) => item.created_by)
    .map((item: any) => {
      const organization = typeof item.organization === 'string' ? item.organization.trim() : '';
      return {
        ...extractBase(item),
        ...(organization ? { organization } : {}),
      };
    });
}

function extractResearchers(items: SupportedProposal[]): SupportedResearcher[] {
  const map = new Map<number, SupportedResearcher>();

  for (const item of items) {
    const { id, authorProfile } = item.createdBy;
    const existing = map.get(id);
    if (existing) {
      existing.fundedAmount.rsc += item.fundedAmount.rsc;
      existing.fundedAmount.usd += item.fundedAmount.usd;
    } else {
      map.set(id, {
        id,
        authorProfile,
        fundedAmount: { ...item.fundedAmount },
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
