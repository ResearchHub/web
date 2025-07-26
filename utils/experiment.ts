import Cookies from 'js-cookie';

export enum Experiment {
  HomepageExperiment = 'homepage_experiment',
}

// Experiment variants
export enum ExperimentVariant {
  A = 'A', // Control group (Current version)
  B = 'B', // Treatment group
}

/**
 * Get the homepage experiment from the cookie.
 *
 * @returns The experiment variant or null if not set.
 */
export function getHomepageExperimentVariant(): string | null {
  if (typeof document === 'undefined') return null;

  return Cookies.get(Experiment.HomepageExperiment) || null;
}

/**
 * Experiments for the application.
 *
 * Each experiment is a function that determines if the experiment is enabled.
 * Centralize all experiment logic here.
 */
export const Experiments: Record<Experiment, () => boolean> = {
  [Experiment.HomepageExperiment]: () =>
    Cookies.get(Experiment.HomepageExperiment) === ExperimentVariant.B,
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
