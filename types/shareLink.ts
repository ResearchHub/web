import { createTransformer } from './transformer';

export interface ShareLinkApiResponse {
  token: string;
  expires_at: string;
  created_date: string;
}

export interface ShareLink {
  token: string;
  expiresAt: Date;
}

export const transformShareLink = createTransformer<ShareLinkApiResponse, ShareLink>((raw) => ({
  token: raw.token,
  expiresAt: new Date(raw.expires_at),
}));
