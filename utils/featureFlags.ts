/**
 * Simple feature flag system for ResearchHub
 */

export enum FeatureFlag {
  NonprofitIntegration = 'nonprofitIntegration',
  LegacyNoteBanner = 'legacyNoteBanner',
  SimplifiedOnboarding = 'simplifiedOnboarding',
}

function getLocalStorageFlag(key: string): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = window.localStorage.getItem(`featureFlag:${key}`);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/**
 * Determine if the current environment is production
 */
export function isProduction(): boolean {
  // Debug flag - set to true to see environment detection logs
  const DEBUG = false;

  // Check for client-side rendering
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production check logic
    const isProd =
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.includes('staging') &&
      !hostname.includes('preview') &&
      !hostname.includes('vercel');

    // Log environment details when in debug mode
    if (DEBUG) {
      console.log('🔍 Environment Detection:');
      console.log(`  📌 Hostname: ${hostname}`);
      console.log(`  🚦 Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT/STAGING'}`);
      console.log(`  🔒 Nonprofit feature: ${!isProd ? 'ENABLED' : 'DISABLED'}`);
    }

    return isProd;
  }

  // Server-side check
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;

  // Production check logic
  const isProd =
    vercelEnv === 'production' ||
    (nodeEnv === 'production' && vercelEnv !== 'preview' && vercelEnv !== 'development');

  // Log environment details when in debug mode
  if (DEBUG) {
    console.log('🔍 Server Environment Detection:');
    console.log(`  📌 NODE_ENV: ${nodeEnv || 'not set'}`);
    console.log(`  📌 VERCEL_ENV: ${vercelEnv || 'not set'}`);
    console.log(`  🚦 Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT/STAGING'}`);
    console.log(`  🔒 Nonprofit feature: ${!isProd ? 'ENABLED' : 'DISABLED'}`);
  }

  return isProd;
}

/**
 * Feature flags for the application.
 *
 * Each flag is a function that determines if the feature is enabled.
 * Centralize all feature flag logic here.
 */
export const FeatureFlags: Record<FeatureFlag, () => boolean> = {
  [FeatureFlag.NonprofitIntegration]: () => true,
  [FeatureFlag.LegacyNoteBanner]: () => true,
  [FeatureFlag.SimplifiedOnboarding]: () => true,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const flagFunction = FeatureFlags[feature];
  if (!flagFunction) {
    console.warn(`Feature flag "${feature}" is not defined.`);
    return false;
  }
  return flagFunction();
}

/**
 * Debug utility to show the status of all feature flags
 * Can be called from browser console: printFeatureStatus()
 */
export function printFeatureStatus(): void {
  const environment = isProduction() ? 'PRODUCTION' : 'DEVELOPMENT/STAGING';

  console.log('🚩 FEATURE FLAGS STATUS');
  console.log(`🌎 Current environment: ${environment}`);
  console.log('-------------------------');

  // Print status of each feature flag
  Object.entries(FeatureFlags).forEach(([name, checkFn]) => {
    const isEnabled = (checkFn as () => boolean)();
    console.log(`${isEnabled ? '✅' : '❌'} ${name}: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
  });

  // Make the function available in the global scope for browser console access
  if (typeof window !== 'undefined') {
    (window as any).printFeatureStatus = printFeatureStatus;
  }
}

// Auto-initialize the global function for browser console access
if (typeof window !== 'undefined') {
  (window as any).printFeatureStatus = printFeatureStatus;
}
