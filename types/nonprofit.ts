import { BaseTransformed, createTransformer } from '@/types/transformer';
import { ID } from '@/types/root';

/**
 * Raw API response types (matching exact server formats)
 */

// Raw nonprofit details from create API and get-by-fundraise nested details
export interface NonprofitDetailsRaw {
  id: number | string;
  name: string;
  ein: string;
  endaoment_org_id: string;
  base_wallet_address?: string;
  created_date?: string;
  updated_date?: string;
}

// Raw nonprofit-fundraise link from get-by-fundraise API
export interface NonprofitLinkRaw {
  id: number | string;
  nonprofit: number | string;
  nonprofit_details: NonprofitDetailsRaw;
  fundraise: number | string;
  note: string;
  created_date: string;
  updated_date: string;
}

// Raw nonprofit organization from search API (note: this has camelCase as it's a proxy endpoint)
export interface NonprofitSearchResultRaw {
  id: string;
  name: string;
  ein: string;
  deployments: {
    isDeployed: boolean;
    chainId: number;
    address: string;
  }[];
  logoUrl?: string;
  nteeCode: string;
  nteeDescription: string;
  description: string;
  address: {
    region: string;
    country: string;
  };
  endaomentUrl: string;
  contibutionCount: number; // API typo preserved
  contibutionTotal: string; // API typo preserved
}

export interface NonprofitFundraiseLinkRaw {
  id: number | string;
  nonprofit: number | string;
  nonprofit_details: NonprofitDetailsRaw;
  fundraise: number | string;
  note: string;
  created_date: string;
  updated_date: string;
}

export interface NonprofitAddress {
  region: string;
  country: string;
}

export interface NonprofitDeployment {
  isDeployed: boolean;
  chainId: number;
  address: string;
}

export interface NonprofitDetails extends BaseTransformed<NonprofitDetailsRaw> {
  id: string;
  name: string;
  ein: string;
  endaomentOrgId: string;
  baseWalletAddress?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface NonprofitLink extends BaseTransformed<NonprofitLinkRaw> {
  id: string;
  nonprofitId: string;
  nonprofitDetails: NonprofitDetails;
  fundraiseId: string;
  note: string;
  createdDate: string;
  updatedDate: string;
}

export interface NonprofitOrg
  extends BaseTransformed<NonprofitSearchResultRaw | NonprofitDetailsRaw> {
  id: string;
  name: string;
  ein: string;
  deployments: NonprofitDeployment[];
  logoUrl?: string;
  nteeCode: string;
  nteeDescription: string;
  description: string;
  address: NonprofitAddress;
  endaomentUrl: string;
  contributionCount: number; // Fixed typo for frontend
  contributionTotal: string; // Fixed typo for frontend
  baseWalletAddress?: string;
  endaomentOrgId: string;
}

export interface NonprofitFundraiseLink extends BaseTransformed<NonprofitFundraiseLinkRaw> {
  id: string;
  nonprofitId: string;
  nonprofitDetails: NonprofitDetails;
  fundraiseId: string;
  note: string;
  createdDate: string;
  updatedDate: string;
}

export interface NonprofitSearchParams {
  searchTerm: string;
  nteeMajorCodes?: string;
  nteeMinorCodes?: string;
  countries?: string;
  count?: number;
  offset?: number;
}

export interface CreateNonprofitParams {
  name: string;
  endaomentOrgId: string;
  ein?: string;
  baseWalletAddress?: string;
}

export interface LinkToFundraiseParams {
  nonprofitId: ID;
  fundraiseId: ID;
  note?: string;
}

export const transformNonprofitDetails = createTransformer<
  NonprofitDetailsRaw,
  Omit<NonprofitDetails, 'raw'>
>((raw) => ({
  id: raw.id.toString(),
  name: raw.name,
  ein: raw.ein,
  endaomentOrgId: raw.endaoment_org_id,
  baseWalletAddress: raw.base_wallet_address,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
}));

export const transformNonprofitLink = createTransformer<
  NonprofitLinkRaw,
  Omit<NonprofitLink, 'raw'>
>((raw) => ({
  id: raw.id.toString(),
  nonprofitId: raw.nonprofit.toString(),
  nonprofitDetails: transformNonprofitDetails(raw.nonprofit_details),
  fundraiseId: raw.fundraise.toString(),
  note: raw.note,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
}));

export const transformNonprofitSearchResult = createTransformer<
  NonprofitSearchResultRaw,
  Omit<NonprofitOrg, 'raw'>
>((raw) => ({
  id: `endaoment-${raw.id}`, // Prefix with 'endaoment-' to make it clear this is an external ID, not our internal DB ID
  name: raw.name,
  ein: raw.ein,
  deployments: [...raw.deployments],
  logoUrl: raw.logoUrl,
  nteeCode: raw.nteeCode,
  nteeDescription: raw.nteeDescription,
  description: raw.description,
  address: { ...raw.address },
  endaomentUrl: raw.endaomentUrl,
  contributionCount: raw.contibutionCount, // Fix typo from API
  contributionTotal: raw.contibutionTotal, // Fix typo from API
  baseWalletAddress: raw.deployments.find((d) => d.chainId === 8453)?.address,
  endaomentOrgId: raw.id,
}));

export const transformNonprofitDetailsToOrg = createTransformer<
  NonprofitDetailsRaw,
  Omit<NonprofitOrg, 'raw'>
>((raw) => {
  const deployments: NonprofitDeployment[] = [];
  if (raw.base_wallet_address) {
    deployments.push({
      isDeployed: true,
      chainId: 8453,
      address: raw.base_wallet_address,
    });
  }

  return {
    id: raw.id.toString(),
    name: raw.name,
    ein: raw.ein,
    deployments,
    baseWalletAddress: raw.base_wallet_address,
    address: { region: '', country: '' },
    nteeCode: '',
    nteeDescription: '',
    description: '',
    endaomentUrl: '',
    contributionCount: 0,
    contributionTotal: '0',
    endaomentOrgId: raw.endaoment_org_id,
  };
});

export const transformNonprofitFundraiseLink = createTransformer<
  NonprofitFundraiseLinkRaw,
  Omit<NonprofitFundraiseLink, 'raw'>
>((raw) => ({
  id: raw.id.toString(),
  nonprofitId: raw.nonprofit.toString(),
  nonprofitDetails: transformNonprofitDetails(raw.nonprofit_details),
  fundraiseId: raw.fundraise.toString(),
  note: raw.note,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
}));
