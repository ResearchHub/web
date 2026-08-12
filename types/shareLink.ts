import { createTransformer } from './transformer';

export interface ShareLinkApiResponse {
  token: string;
  expires_at: string;
  created_date: string;
}

/**
 * An active share link for a proposal.
 *
 * The token is the sole credential: anyone holding it can read the proposal
 * anonymously until `expiresAt`.
 */
export interface ShareLink {
  token: string;
  expiresAt: Date;
  createdDate: Date;
}

export const transformShareLink = createTransformer<ShareLinkApiResponse, ShareLink>((raw) => ({
  token: raw.token,
  expiresAt: new Date(raw.expires_at),
  createdDate: new Date(raw.created_date),
}));
