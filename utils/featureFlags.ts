/**
 * Simple feature flag system for ResearchHub
 */

/**
 * Determine if the current environment is production
 */
export function isProduction(): boolean {
  // Check for client-side rendering
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Not localhost or staging/preview means production
    return (
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.includes('staging') &&
      !hostname.includes('preview') &&
      !hostname.includes('vercel')
    );
  }

  // Server-side check
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'production') {
    return true;
  }

  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production' && vercelEnv !== 'preview' && vercelEnv !== 'development') {
    return true;
  }

  return false;
}

/**
 * Feature flags for the application.
 *
 * Each flag is a function that determines if the feature is enabled.
 * Centralize all feature flag logic here.
 */
export const FeatureFlags = {
  /**
   * Nonprofit integration feature
   * Enabled in all environments except production
   */
  nonprofitIntegration: (): boolean => {
    return !isProduction();
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureName: keyof typeof FeatureFlags): boolean {
  const flagFunction = FeatureFlags[featureName];
  if (!flagFunction) {
    console.warn(`Feature flag "${featureName}" is not defined.`);
    return false;
  }

  return flagFunction();
}
