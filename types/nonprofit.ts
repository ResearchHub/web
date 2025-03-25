/**
 * Types for nonprofit organizations
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

/**
 * Raw nonprofit details as returned from the API
 */
export interface NonprofitDetails {
  id: string | number;
  name: string;
  ein: string;
  endaoment_org_id: string;
  base_wallet_address?: string;
  created_date?: string;
  updated_date?: string;
}

/**
 * Represents a link between a nonprofit and a fundraise
 */
export interface NonprofitLink {
  id: string | number;
  nonprofit: string | number;
  nonprofit_details: NonprofitDetails;
  fundraise: string | number;
  note: string;
  created_date: string;
  updated_date: string;
}

/**
 * Represents a nonprofit organization
 */
export interface NonprofitOrg {
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
  contibutionCount: number;
  contibutionTotal: string;
  baseWalletAddress?: string; // Base network wallet address (chainId: 8453)
  endaoment_org_id?: string; // ID used for Endaoment integration
}

/**
 * Parameters for searching nonprofit organizations
 */
export interface NonprofitSearchParams {
  searchTerm: string;
  nteeMajorCodes?: string;
  nteeMinorCodes?: string;
  countries?: string;
  count?: number;
  offset?: number;
}
