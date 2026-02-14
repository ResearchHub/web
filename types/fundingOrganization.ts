export interface FundingOrganization {
  slug: string;
  name: string;
  imageUrl?: string;
  description: string;
  totalFunding: { usd: number; rsc: number; formatted: string };
  grantCount: number;
}
