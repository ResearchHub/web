/**
 * Reads a variable the suite cannot run without.
 *
 * Every smoke setting is required rather than defaulted: a default would let a
 * misconfigured run silently point at the wrong environment or the wrong
 * content, and fail later as an assertion that looks like a product bug.
 */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required to run the smoke tests. ` +
        'Set it in .env.development, or pass it inline on the command line.'
    );
  }
  return value;
}
