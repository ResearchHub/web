/**
 * Simple feature flag system for ResearchHub
 */

export enum FeatureFlag {
  LegacyNoteBanner = 'legacyNoteBanner',
  NotebookChatAssistant = 'notebookChatAssistant',
}

function getLocalStorageFlag(key: FeatureFlag): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = window.localStorage.getItem(`ff:${key}`);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/**
 * Persist a flag override for this browser, or clear it with `null`.
 *
 * Lets a URL parameter switch a flag on for one tester without a deploy; the
 * override survives navigation, which a query string alone would not.
 */
export function setFeatureOverride(key: FeatureFlag, value: boolean | null): void {
  if (typeof window === 'undefined') return;
  if (value === null) {
    window.localStorage.removeItem(`ff:${key}`);
    return;
  }
  window.localStorage.setItem(`ff:${key}`, String(value));
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
  [FeatureFlag.LegacyNoteBanner]: () => true,
  // Off until a tester opts in with ?assistant=1, so the notebook assistant
  // stays invisible to editors and moderators during the trial.
  [FeatureFlag.NotebookChatAssistant]: () =>
    getLocalStorageFlag(FeatureFlag.NotebookChatAssistant) ?? false,
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
