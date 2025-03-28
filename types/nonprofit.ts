import { BaseTransformed, createTransformer } from '@/types/transformer';
import { ID } from '@/types/root';
import { CHAIN_IDS } from '@/constants/chains';

/**
 * App-side models and transformation utilities for nonprofit data
 */

/**
 * Application model interfaces - these match our frontend needs
 */
export interface NonprofitAddress {
  region: string;
  country: string;
}

export interface NonprofitDeployment {
  isDeployed: boolean;
  chainId: number;
  address: string;
}

export interface NonprofitDetails extends BaseTransformed {
  id: string;
  name: string;
  ein: string;
  endaomentOrgId: string;
  baseWalletAddress?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface NonprofitLink extends BaseTransformed {
  id: string;
  nonprofitId: string;
  nonprofitDetails: NonprofitDetails;
  fundraiseId: string;
  note: string;
  createdDate: string;
  updatedDate: string;
}

export interface NonprofitOrg extends BaseTransformed {
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

export interface NonprofitFundraiseLink extends BaseTransformed {
  id: string;
  nonprofitId: string;
  nonprofitDetails: NonprofitDetails;
  fundraiseId: string;
  note: string;
  createdDate: string;
  updatedDate: string;
}

/**
 * API request parameters
 */
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

/**
 * Transformer functions
 */
export const transformNonprofitDetails = createTransformer<any, Omit<NonprofitDetails, 'raw'>>(
  (raw) => ({
    id: raw.id.toString(),
    name: raw.name,
    ein: raw.ein,
    endaomentOrgId: raw.endaoment_org_id,
    baseWalletAddress: raw.base_wallet_address,
    createdDate: raw.created_date,
    updatedDate: raw.updated_date,
  })
);

export const transformNonprofitLink = createTransformer<any, Omit<NonprofitLink, 'raw'>>((raw) => ({
  id: raw.id.toString(),
  nonprofitId: raw.nonprofit.toString(),
  nonprofitDetails: transformNonprofitDetails(raw.nonprofit_details),
  fundraiseId: raw.fundraise.toString(),
  note: raw.note,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
}));

export const transformNonprofitSearchResult = createTransformer<any, Omit<NonprofitOrg, 'raw'>>(
  (raw) => ({
    // For search results (camelCase from proxy endpoint)
    id: `endaoment-${raw.id}`, // Prefix with 'endaoment-' to make it clear this is an external ID
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
    baseWalletAddress: raw.deployments.find(
      (d: NonprofitDeployment) => d.chainId === CHAIN_IDS.BASE
    )?.address,
    endaomentOrgId: raw.id,
  })
);

export const transformNonprofitDetailsToOrg = createTransformer<any, Omit<NonprofitOrg, 'raw'>>(
  (raw) => {
    const deployments: NonprofitDeployment[] = [];
    if (raw.base_wallet_address) {
      deployments.push({
        isDeployed: true,
        chainId: CHAIN_IDS.BASE,
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
  }
);

export const transformNonprofitFundraiseLink = createTransformer<
  any,
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
