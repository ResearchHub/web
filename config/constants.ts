// Authentication token key used in cookies - it matches the old app's token name (rh-web/config/constants.js)
export const AUTH_TOKEN = 'researchhub.auth.token';

// ResearchHub Foundation account user ID - bounties created by this account display a flat $150 USD amount
// Set via NEXT_PUBLIC_FOUNDATION_USER_ID environment variable
export const FOUNDATION_USER_ID = process.env.NEXT_PUBLIC_FOUNDATION_USER_ID
  ? parseInt(process.env.NEXT_PUBLIC_FOUNDATION_USER_ID, 10)
  : null;

// Flat USD amount to display for Foundation bounties (regardless of actual RSC amount)
export const FOUNDATION_BOUNTY_FLAT_USD = 150;

// The grant feed carries no creator, so Foundation RFPs are recognized by their organization.
export const FOUNDATION_ORGANIZATION_NAME = 'ResearchHub Foundation';

// The Foundation opens RFPs in bulk; on /fund only those funded at least this much (amount +
// pool) show, unless an admin turns on "Show all RFPs".
export const FOUNDATION_RFP_MIN_USD = 1000;

// Cloudflare Turnstile sitekey
export const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || null;
