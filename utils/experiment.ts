import Cookies from 'js-cookie';

export enum Experiment {
  FollowingFeedOrdering = 'following_feed_ordering',
}
// HomepageExperiment = 'homepage_experiment', // Experiment killed. Leaving for further reference usage.

// Experiment variants
export enum ExperimentVariant {
  A = 'A', // Control group (Current version)
  B = 'B', // Treatment group
}

/**
 * Get the homepage experiment from the cookie.
 *
 * @returns The experiment variant or null if not set.
 * @deprecated Experiment has been killed
 */
// export function getHomepageExperimentVariant(): string | null {
//   if (typeof document === 'undefined') return null;

//   return Cookies.get(Experiment.HomepageExperiment) || null;
// }

/**
 * Get or assign experiment variant for a user.
 * Uses cookie to persist the variant assignment.
 *
 * @param experiment The experiment name
 * @param userId Optional user ID for deterministic assignment
 * @returns The experiment variant (A or B)
 */
export function getExperimentVariant(experiment: Experiment, userId?: number): ExperimentVariant {
  if (typeof document === 'undefined') {
    // Server-side: default to control
    return ExperimentVariant.A;
  }

  // Check if user already has a variant assigned
  const existingVariant = Cookies.get(experiment);
  if (existingVariant === ExperimentVariant.A || existingVariant === ExperimentVariant.B) {
    return existingVariant as ExperimentVariant;
  }

  // Assign new variant
  let variant: ExperimentVariant;
  if (userId) {
    // Deterministic assignment based on user ID (50/50 split)
    variant = userId % 2 === 0 ? ExperimentVariant.A : ExperimentVariant.B;
  } else {
    // Random assignment (50/50 split)
    variant = Math.random() < 0.5 ? ExperimentVariant.A : ExperimentVariant.B;
  }

  // Store in cookie (30 days expiry)
  Cookies.set(experiment, variant, { expires: 30 });

  return variant;
}

/**
 * Experiments for the application.
 *
 * Each experiment is a function that determines if the experiment is enabled.
 * Centralize all experiment logic here.
 */
export const Experiments: Record<Experiment, () => boolean> = {
  [Experiment.FollowingFeedOrdering]: () =>
    Cookies.get(Experiment.FollowingFeedOrdering) === ExperimentVariant.B,
  // [Experiment.HomepageExperiment]: () =>
  //   Cookies.get(Experiment.HomepageExperiment) === ExperimentVariant.B,
};

/**
 * Check if an experiment is enabled
 */
export function isExperimentEnabled(experiment: Experiment): boolean {
  const experimentFunction = Experiments[experiment];
  if (!experimentFunction) {
    console.warn(`Experiment "${experiment}" is not defined.`);
    return false;
  }

  return experimentFunction();
}

/**
 * Check if an experiment is enabled on the server.
 *
 * @param experimentVariant The experiment variant from the request (for server-side)
 * @returns True if the experiment is enabled, false otherwise.
 */
export function isExperimentEnabledServer(experimentVariant?: ExperimentVariant | null): boolean {
  return experimentVariant === ExperimentVariant.B;
}
