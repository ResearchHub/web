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
