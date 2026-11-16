import { createTransformer } from './transformer';

export interface OAuthScope {
  name: string;
  description: string;
}

export interface OAuthConsentRequestApiResponse {
  client_name: string;
  redirect_host: string;
  loopback_redirect: boolean;
  scopes: OAuthScope[];
}

export interface OAuthRedirectApiResponse {
  redirect_url: string;
}

export interface OAuthConsentRequest {
  clientName: string;
  redirectHost: string;
  loopbackRedirect: boolean;
  scopes: OAuthScope[];
}

export const transformOAuthConsentRequest = createTransformer<
  OAuthConsentRequestApiResponse,
  OAuthConsentRequest
>((raw) => ({
  clientName: raw.client_name,
  redirectHost: raw.redirect_host,
  loopbackRedirect: raw.loopback_redirect,
  scopes: raw.scopes,
}));

export interface ConnectedAppApiResponse {
  id: number;
  name: string;
  scopes: OAuthScope[];
  last_used_at: string;
}

export interface ConnectedApp {
  id: number;
  name: string;
  scopes: OAuthScope[];
  lastUsedAt: string;
}

export const transformConnectedApp = createTransformer<ConnectedAppApiResponse, ConnectedApp>(
  (raw) => ({
    id: raw.id,
    name: raw.name,
    scopes: raw.scopes,
    lastUsedAt: raw.last_used_at,
  })
);
