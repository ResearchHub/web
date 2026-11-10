// Authentication token key used in cookies - it matches the old app's token name (rh-web/config/constants.js)
export const AUTH_TOKEN = 'researchhub.auth.token';

// ResearchHub Foundation account user ID - bounties created by this account display a flat $150 USD amount
// Set via NEXT_PUBLIC_FOUNDATION_USER_ID environment variable
export const FOUNDATION_USER_ID = process.env.NEXT_PUBLIC_FOUNDATION_USER_ID
  ? parseInt(process.env.NEXT_PUBLIC_FOUNDATION_USER_ID, 10)
  : null;

// Flat USD amount to display for Foundation bounties (regardless of actual RSC amount)
export const FOUNDATION_BOUNTY_FLAT_USD = 150;

// Post ID of the ResearchHub-run RFP whose funding pool takes the Giving Tuesday "Give to science" gifts
// Set via NEXT_PUBLIC_GIVING_TUESDAY_FUND_POST_ID environment variable
export const GIVING_TUESDAY_FUND_POST_ID =
  process.env.NEXT_PUBLIC_GIVING_TUESDAY_FUND_POST_ID || null;

// Cloudflare Turnstile sitekey
export const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || null;
